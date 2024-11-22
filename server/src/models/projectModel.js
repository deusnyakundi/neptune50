const db = require('../db');
const { DatabaseError } = require('../utils/errors');
const cache = require('../utils/cache');

class ProjectModel {
  STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ON_HOLD: 'on_hold',
  };

  async create(data) {
    const { description, region, msp, partner, created_by } = data;
    
    try {
      const { rows } = await db.query(
        `INSERT INTO projects 
        (description, region, msp, partner, created_by, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [description, region, msp, partner, created_by, this.STATUS.PENDING]
      );
      
      return rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to create project', error);
    }
  }

  async findAll(filters = {}) {
    try {
      let query = `
        SELECT p.*, u.name as engineer_name
        FROM projects p
        LEFT JOIN users u ON p.engineer = u.email
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        params.push(filters.status);
        query += ` AND p.status = $${params.length}`;
      }

      if (filters.region) {
        params.push(filters.region);
        query += ` AND p.region = $${params.length}`;
      }

      if (filters.search) {
        params.push(`%${filters.search}%`);
        query += ` AND (
          p.description ILIKE $${params.length} OR
          p.msp ILIKE $${params.length} OR
          p.partner ILIKE $${params.length}
        )`;
      }

      query += ' ORDER BY p.created_at DESC';

      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch projects', error);
    }
  }

  async findByEngineer(email) {
    try {
      const { rows } = await db.query(
        `SELECT p.*, u.name as engineer_name
        FROM projects p
        LEFT JOIN users u ON p.engineer = u.email
        WHERE p.engineer = $1
        ORDER BY p.created_at DESC`,
        [email]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch engineer projects', error);
    }
  }

  async updateStatus(id, data) {
    const { status, notes, updated_by } = data;
    
    try {
      const { rows } = await db.query(
        `UPDATE projects
        SET status = $1,
            notes = $2,
            updated_by = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *`,
        [status, notes, updated_by, id]
      );
      
      if (!rows[0]) {
        throw new Error('Project not found');
      }
      
      return rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to update project status', error);
    }
  }

  async start(id, data) {
    const { engineer, notes } = data;
    
    try {
      const { rows } = await db.query(
        `UPDATE projects
        SET status = $1,
            engineer = $2,
            notes = $3,
            updated_at = NOW()
        WHERE id = $4 AND status = $5
        RETURNING *`,
        [this.STATUS.IN_PROGRESS, engineer, notes, id, this.STATUS.PENDING]
      );
      
      if (!rows[0]) {
        throw new Error('Project not found or not in pending status');
      }
      
      return rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to start project', error);
    }
  }

  async findAllOptimized(filters = {}) {
    const cacheKey = cache.generateKey('projects', filters);
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Optimize query with materialized view for frequently accessed data
      let query = `
        WITH project_stats AS MATERIALIZED (
          SELECT 
            p.*,
            u.name as engineer_name,
            COUNT(*) OVER() as total_count
          FROM projects p
          LEFT JOIN users u ON p.engineer = u.email
          WHERE 1=1
      `;
      
      const params = [];
      const conditions = [];

      if (filters.status) {
        params.push(filters.status);
        conditions.push(`p.status = $${params.length}`);
      }

      if (filters.region) {
        params.push(filters.region);
        conditions.push(`p.region = $${params.length}`);
      }

      if (filters.search) {
        params.push(`%${filters.search}%`);
        conditions.push(`(
          p.description ILIKE $${params.length} OR
          p.msp ILIKE $${params.length} OR
          p.partner ILIKE $${params.length}
        )`);
      }

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      query += `
        )
        SELECT * FROM project_stats
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(filters.limit || 10, filters.offset || 0);

      const { rows } = await db.query(query, params);
      
      const result = {
        data: rows,
        total: rows[0]?.total_count || 0,
        page: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
        totalPages: Math.ceil((rows[0]?.total_count || 0) / (filters.limit || 10)),
      };

      await cache.set(cacheKey, result, 300); // Cache for 5 minutes
      return result;
    } catch (error) {
      throw new DatabaseError('Failed to fetch projects', error);
    }
  }
}

module.exports = new ProjectModel(); 