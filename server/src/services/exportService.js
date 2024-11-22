const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { format } = require('date-fns');
const logger = require('../utils/logger');

class ExportService {
  async exportToExcel(data, options = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Data');

    try {
      // Set headers
      worksheet.columns = this.generateColumns(data[0], options.columns);

      // Add data
      worksheet.addRows(data.map(item => this.formatRowData(item, options.columns)));

      // Style the worksheet
      this.styleWorksheet(worksheet, options);

      // Generate buffer
      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      logger.error('Excel export error:', error);
      throw new Error('Failed to generate Excel export');
    }
  }

  async exportToPDF(data, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Add title
        if (options.title) {
          doc.fontSize(16).text(options.title, { align: 'center' });
          doc.moveDown();
        }

        // Add metadata
        doc.fontSize(10).text(`Generated: ${format(new Date(), 'PPpp')}`);
        doc.moveDown();

        // Add data table
        this.generatePDFTable(doc, data, options);

        doc.end();
      } catch (error) {
        logger.error('PDF export error:', error);
        reject(new Error('Failed to generate PDF export'));
      }
    });
  }

  generateColumns(sample, customColumns = {}) {
    const columns = [];
    const fields = Object.keys(sample);

    fields.forEach(field => {
      const column = {
        header: this.formatHeader(field),
        key: field,
        width: 15,
        ...customColumns[field],
      };
      columns.push(column);
    });

    return columns;
  }

  formatHeader(field) {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatRowData(item, columns) {
    const row = {};
    Object.keys(item).forEach(key => {
      if (columns && columns[key] && columns[key].format) {
        row[key] = columns[key].format(item[key]);
      } else {
        row[key] = item[key];
      }
    });
    return row;
  }

  styleWorksheet(worksheet, options) {
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(
        column.header.length,
        ...worksheet.getColumn(column.key).values.map(v => v?.toString().length || 0)
      ) + 2;
    });

    // Add borders
    worksheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  }

  generatePDFTable(doc, data, options) {
    const tableTop = doc.y;
    const columns = options.columns || Object.keys(data[0]);
    const columnWidth = (doc.page.width - 100) / columns.length;

    // Draw headers
    let x = 50;
    columns.forEach(column => {
      doc.text(this.formatHeader(column), x, tableTop);
      x += columnWidth;
    });

    // Draw data
    let y = tableTop + 20;
    data.forEach(row => {
      x = 50;
      columns.forEach(column => {
        doc.text(row[column]?.toString() || '', x, y);
        x += columnWidth;
      });
      y += 20;

      // Add new page if needed
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
    });
  }
}

module.exports = new ExportService(); 