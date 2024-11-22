const BaseController = require('./baseController');
const provisioningModel = require('../models/provisioningModel');
const excel = require('../utils/excel');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class ProvisioningController extends BaseController {
  async bulkProvision(req, res) {
    await this.handleRequest(req, res, async () => {
      if (!req.file) {
        throw new ValidationError('Excel file is required');
      }

      const { ticketNumber, reason } = req.body;
      if (!ticketNumber || !reason) {
        throw new ValidationError('Ticket number and reason are required');
      }

      // Parse Excel file
      const devices = await excel.parseProvisioningFile(req.file.buffer);
      
      // Create provisioning log
      const log = await provisioningModel.createLog({
        ticket_number: ticketNumber,
        reason,
        created_by: req.user.email,
        total_devices: devices.length,
      });

      // Process devices in batches
      const batchSize = 10;
      const results = [];
      
      for (let i = 0; i < devices.length; i += batchSize) {
        const batch = devices.slice(i, i + batchSize);
        const batchResults = await provisioningModel.processDevices(
          batch,
          log.id
        );
        results.push(...batchResults);

        // Update progress
        await provisioningModel.updateLogProgress(log.id, {
          processed: i + batch.length,
          success: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        });
      }

      this.success(res, { results });
    });
  }

  async getProvisioningHistory(req, res) {
    await this.handleRequest(req, res, async () => {
      const { startDate, endDate, status } = req.query;
      const history = await provisioningModel.findLogs({
        startDate,
        endDate,
        status,
        user: req.user.email,
      });

      this.success(res, history);
    });
  }

  async exportResults(req, res) {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      const results = await provisioningModel.findResults(id);
      
      const workbook = excel.createResultsWorkbook(results);
      
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=provisioning-results.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    });
  }
}

module.exports = new ProvisioningController(); 