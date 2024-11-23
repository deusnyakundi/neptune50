const db = require('../db');
const { redisUtils } = require('../utils/redis');

class DashboardModel {
  // Get overview statistics
  async getOverviewStats() {
    try {
      const stats = await redisUtils.get('dashboard:overview');
      if (stats) return JSON.parse(stats);

      const queries = {
        totalProjects: `
          SELECT COUNT(*) as count 
          FROM projects
        `,
        projectsByStatus: `
          SELECT status, COUNT(*) as count 
          FROM projects 
          GROUP BY status
        `,
        totalDevices: `
          SELECT COUNT(*) as count 
          FROM devices
        `,
        devicesByStatus: `
          SELECT status, COUNT(*) as count 
          FROM devices 
          GROUP BY status
        `,
        recentProjects: `
          SELECT p.*, u.name as assigned_engineer_name 
          FROM projects p 
          LEFT JOIN users u ON p.assigned_to = u.id 
          ORDER BY p.created_at DESC 
          LIMIT 5
        `,
        engineerStats: `
          SELECT 
            u.name as engineer_name,
            COUNT(p.id) as total_projects,
            COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_projects
          FROM users u
          LEFT JOIN projects p ON u.id = p.assigned_to
          WHERE u.role = 'engineer'
          GROUP BY u.id, u.name
        `
      };

      const results = {};
      
      for (const [key, query] of Object.entries(queries)) {
        const { rows } = await db.query(query);
        results[key] = key.endsWith('Stats') || key.endsWith('ByStatus') ? rows : rows[0]?.count || 0;
      }

      // Cache the results for 5 minutes
      await redisUtils.set('dashboard:overview', JSON.stringify(results), 300);
      
      return results;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get project timeline
  async getProjectTimeline() {
    try {
      const query = `
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as count,
          status
        FROM projects
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at), status
        ORDER BY date DESC
      `;

      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching project timeline:', error);
      throw error;
    }
  }

  // Get engineer performance metrics
  async getEngineerMetrics() {
    try {
      const query = `
        SELECT 
          u.name as engineer_name,
          COUNT(p.id) as total_projects,
          COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_projects,
          AVG(EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/3600)::numeric(10,2) as avg_completion_time
        FROM users u
        LEFT JOIN projects p ON u.id = p.assigned_to
        WHERE u.role = 'engineer'
        GROUP BY u.id, u.name
      `;

      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching engineer metrics:', error);
      throw error;
    }
  }
}

module.exports = new DashboardModel(); 