const db = require('../db');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { DatabaseError } = require('../utils/errors');

class ActivityTrackingService {
  constructor() {
    this.ACTIVITY_TYPES = {
      LOGIN: 'login',
      LOGOUT: 'logout',
      VIEW_PROJECT: 'view_project',
      CREATE_PROJECT: 'create_project',
      UPDATE_PROJECT: 'update_project',
      DELETE_PROJECT: 'delete_project',
      EXPORT_REPORT: 'export_report',
      BULK_ACTION: 'bulk_action',
      API_ACCESS: 'api_access',
    };
  }

  async trackActivity(data) {
    const {
      userId,
      type,
      entityId = null,
      entityType = null,
      metadata = {},
      ipAddress = null,
      userAgent = null,
    } = data;

    try {
      const { rows } = await db.query(
        `INSERT INTO user_activities 
        (user_id, activity_type, entity_id, entity_type, metadata, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [userId, type, entityId, entityType, metadata, ipAddress, userAgent]
      );

      // Invalidate relevant caches
      await this.invalidateActivityCaches(userId);

      return rows[0];
    } catch (error) {
      logger.error('Failed to track activity:', error);
      throw new DatabaseError('Failed to track user activity');
    }
  }

  async getUserActivities(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      type,
      entityType,
    } = options;

    let query = `
      SELECT 
        ua.*,
        u.email as user_email,
        u.name as user_name
      FROM user_activities ua
      JOIN users u ON ua.user_id = u.id
      WHERE ua.user_id = $1
    `;
    const params = [userId];

    if (startDate) {
      query += ` AND ua.created_at >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND ua.created_at <= $${params.length + 1}`;
      params.push(endDate);
    }

    if (type) {
      query += ` AND ua.activity_type = $${params.length + 1}`;
      params.push(type);
    }

    if (entityType) {
      query += ` AND ua.entity_type = $${params.length + 1}`;
      params.push(entityType);
    }

    query += ` ORDER BY ua.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    try {
      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Failed to fetch user activities:', error);
      throw new DatabaseError('Failed to fetch user activities');
    }
  }

  async getActivityStats(userId, timeframe = '24h') {
    const cacheKey = `activity_stats:${userId}:${timeframe}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const query = `
        SELECT 
          activity_type,
          COUNT(*) as count,
          MIN(created_at) as first_occurrence,
          MAX(created_at) as last_occurrence
        FROM user_activities
        WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '1 ${timeframe}'
        GROUP BY activity_type
      `;

      const { rows } = await db.query(query, [userId]);
      
      // Cache for 5 minutes
      await cache.set(cacheKey, rows, 300);
      
      return rows;
    } catch (error) {
      logger.error('Failed to fetch activity stats:', error);
      throw new DatabaseError('Failed to fetch activity statistics');
    }
  }

  async getRecentActivities(options = {}) {
    const {
      limit = 10,
      entityType,
      entityId,
    } = options;

    let query = `
      SELECT 
        ua.*,
        u.email as user_email,
        u.name as user_name
      FROM user_activities ua
      JOIN users u ON ua.user_id = u.id
    `;
    const params = [];

    if (entityType && entityId) {
      query += ` WHERE ua.entity_type = $1 AND ua.entity_id = $2`;
      params.push(entityType, entityId);
    }

    query += ` ORDER BY ua.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    try {
      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Failed to fetch recent activities:', error);
      throw new DatabaseError('Failed to fetch recent activities');
    }
  }

  async invalidateActivityCaches(userId) {
    const patterns = [
      `activity_stats:${userId}:*`,
      `user_activities:${userId}:*`,
    ];

    for (const pattern of patterns) {
      await cache.invalidatePattern(pattern);
    }
  }
}

module.exports = new ActivityTrackingService(); 