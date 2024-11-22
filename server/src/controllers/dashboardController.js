const BaseController = require('./baseController');
const dashboardModel = require('../models/dashboardModel');

class DashboardController extends BaseController {
  async getMetrics(req, res) {
    await this.handleRequest(req, res, async () => {
      const { range } = req.query;
      const metrics = await dashboardModel.getMetrics(range);
      this.success(res, metrics);
    });
  }

  async getProjectStatistics(req, res) {
    await this.handleRequest(req, res, async () => {
      const { range } = req.query;
      const stats = await dashboardModel.getProjectStats(range);
      this.success(res, stats);
    });
  }

  async getProvisioningStatistics(req, res) {
    await this.handleRequest(req, res, async () => {
      const { range } = req.query;
      const stats = await dashboardModel.getProvisioningStats(range);
      this.success(res, stats);
    });
  }
}

module.exports = new DashboardController(); 