const ExcelJS = require('exceljs');
const { ValidationError } = require('./errors');

class ExcelUtility {
  async parseProvisioningFile(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new ValidationError('Excel file is empty');
    }

    const devices = [];
    const requiredColumns = ['Serial Number', 'CI Number'];

    // Validate headers
    const headers = worksheet.getRow(1).values;
    requiredColumns.forEach(column => {
      if (!headers.includes(column)) {
        throw new ValidationError(`Missing required column: ${column}`);
      }
    });

    // Parse rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const serialNumber = row.getCell('Serial Number').value;
      const ciNumber = row.getCell('CI Number').value;

      if (!serialNumber || !ciNumber) {
        throw new ValidationError(
          `Missing required data in row ${rowNumber}`
        );
      }

      devices.push({
        serialNumber: serialNumber.toString().trim(),
        ciNumber: ciNumber.toString().trim(),
      });
    });

    return devices;
  }

  createProjectsWorkbook(projects) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projects');

    worksheet.columns = [
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Region', key: 'region', width: 15 },
      { header: 'MSP', key: 'msp', width: 20 },
      { header: 'Partner', key: 'partner', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Engineer', key: 'engineer_name', width: 20 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];

    projects.forEach(project => {
      worksheet.addRow({
        ...project,
        created_at: new Date(project.created_at).toLocaleString(),
      });
    });

    return workbook;
  }

  createResultsWorkbook(results) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Provisioning Results');

    worksheet.columns = [
      { header: 'Serial Number', key: 'serial_number', width: 20 },
      { header: 'CI Number', key: 'ci_number', width: 20 },
      { header: 'Status', key: 'success', width: 15 },
      { header: 'Message', key: 'message', width: 40 },
      { header: 'Timestamp', key: 'created_at', width: 20 },
    ];

    results.forEach(result => {
      worksheet.addRow({
        ...result,
        success: result.success ? 'Success' : 'Failed',
        created_at: new Date(result.created_at).toLocaleString(),
      });
    });

    return workbook;
  }
}

module.exports = new ExcelUtility(); 