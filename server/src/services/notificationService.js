const wsEvents = require('../websocket/events');
const db = require('../db');
const cache = require('../utils/cache');

class NotificationService {
  constructor() {
    this.NOTIFICATION_TYPES = {
      PROJECT_UPDATE: 'project_update',
      PROVISIONING_COMPLETE: 'provisioning_complete',
      SYSTEM_ALERT: 'system_alert',
      ASSIGNMENT: 'assignment',
    };
  }

  async createNotification(data) {
    try {
      const { rows } = await db.query(
        `INSERT INTO notifications 
        (type, user_id, title, message, metadata, read)
        VALUES ($1, $2, $3, $4, $5, false)
        RETURNING *`,
        [data.type, data.userId, data.title, data.message, data.metadata]
      );

      const notification = rows[0];
      
      // Emit websocket event
      wsEvents.emit('notification', {
        type: 'new_notification',
        data: notification,
        userId: data.userId,
      });

      // Invalidate cache
      await cache.invalidatePattern(`notifications:${data.userId}:*`);

      return notification;
    } catch (error) {
      throw new Error('Failed to create notification: ' + error.message);
    }
  }

  async getUserNotifications(userId, options = {}) {
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const cacheKey = `notifications:${userId}:${limit}:${offset}`;

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { rows } = await db.query(
        `SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const result = {
        notifications: rows,
        unreadCount: await this.getUnreadCount(userId),
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, result, 300);

      return result;
    } catch (error) {
      throw new Error('Failed to fetch notifications: ' + error.message);
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const { rows } = await db.query(
        `UPDATE notifications
        SET read = true
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
        [notificationId, userId]
      );

      await cache.invalidatePattern(`notifications:${userId}:*`);
      return rows[0];
    } catch (error) {
      throw new Error('Failed to mark notification as read: ' + error.message);
    }
  }

  async getUnreadCount(userId) {
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM notifications
      WHERE user_id = $1 AND read = false`,
      [userId]
    );
    return parseInt(rows[0].count);
  }

  // Helper methods for common notifications
  async notifyProjectUpdate(project, users) {
    for (const userId of users) {
      await this.createNotification({
        type: this.NOTIFICATION_TYPES.PROJECT_UPDATE,
        userId,
        title: 'Project Updated',
        message: `Project ${project.id} has been updated to ${project.status}`,
        metadata: { projectId: project.id },
      });
    }
  }

  async notifyProvisioningComplete(result, userId) {
    await this.createNotification({
      type: this.NOTIFICATION_TYPES.PROVISIONING_COMPLETE,
      userId,
      title: 'Provisioning Complete',
      message: `Bulk provisioning completed with ${result.success} successes and ${result.failed} failures`,
      metadata: { provisioningId: result.id },
    });
  }
}

module.exports = new NotificationService(); 