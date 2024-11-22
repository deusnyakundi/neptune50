const BaseController = require('./baseController');
const projectModel = require('../models/projectModel');
const { ValidationError } = require('../utils/errors');
const excel = require('../utils/excel');

class ProjectController extends BaseController {
  async createProject(req, res) {
    await this.handleRequest(req, res, async () => {
      const { description, region, msp, partner } = req.body;
      
      if (!description || !region || !msp || !partner) {
        throw new ValidationError('All fields are required');
      }

      const project = await projectModel.create({
        description,
        region,
        msp,
        partner,
        created_by: req.user.email,
      });

      this.success(res, project, 201);
    });
  }

  async getProjects(req, res) {
    await this.handleRequest(req, res, async () => {
      const { status, region, search } = req.query;
      const filters = { status, region, search };

      const projects = await projectModel.findAll(filters);
      this.success(res, projects);
    });
  }

  async getMyProjects(req, res) {
    await this.handleRequest(req, res, async () => {
      const projects = await projectModel.findByEngineer(req.user.email);
      this.success(res, projects);
    });
  }

  async updateProjectStatus(req, res) {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!Object.values(projectModel.STATUS).includes(status)) {
        throw new ValidationError('Invalid status');
      }

      const project = await projectModel.updateStatus(id, {
        status,
        notes,
        updated_by: req.user.email,
      });

      this.success(res, project);
    });
  }

  async startProject(req, res) {
    await this.handleRequest(req, res, async () => {
      const { id } = req.params;
      const { notes } = req.body;

      const project = await projectModel.start(id, {
        engineer: req.user.email,
        notes,
      });

      this.success(res, project);
    });
  }

  async exportProjects(req, res) {
    await this.handleRequest(req, res, async () => {
      const projects = await projectModel.findAll(req.query);
      const workbook = excel.createProjectsWorkbook(projects);
      
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=projects.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    });
  }
}

module.exports = new ProjectController(); 