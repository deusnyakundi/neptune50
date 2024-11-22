const db = require('../db');
const { DatabaseError } = require('../utils/errors');
const provisioningService = require('../services/provisioningService');

class ProvisioningModel {
  async createLog(data) {
    const { ticket_number, reason, created_by, total_devices } = data;
    
    try {
      const { rows } = await db.query(
        `INSERT INTO provisioning_logs
        (ticket_number, reason, created_by, total_devices)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [ticket_number, reason, created_by, total_devices]
      );
      
      return rows[0];
    } catch (error) {
      throw new DatabaseError('Failed to create provisioning log', error);
    }
  }

  async processDevices(devices, logId) {
    const results = [];
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      for (const device of devices) {
        try {
          // Call external provisioning service
          const provisioningResult = await provisioningService.provisionDevice(device);
          
          // Store result
          const { rows } = await client.query(
            `INSERT INTO provisioning_results
            (log_id, serial_number, ci_number, success, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
              logId,
              device.serialNumber,
              device.ciNumber,
              provisioningResult.success,
              provisioningResult.message,
            ]
          );
          
          results.push(rows[0]);
        } catch (error) {
          results.push({
            serial_number: device.serialNumber,
            ci_number: device.ciNumber,
            success: false,
            message: error.message,
          });
        }
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new DatabaseError('Failed to process devices', error);
    } finally {
      client.release();
    }
  }

  async updateLogProgress(logId, progress) {
    try {
      await db.query(
        `UPDATE provisioning_logs
        SET processed_devices = $1,
            successful_devices = $2,
            failed_devices = $3,
            updated_at = NOW()
        WHERE id = $4`,
        [progress.processed, progress.success, progress.failed, logId]
      );
    } catch (error) {
      throw new DatabaseError('Failed to update log progress', error);
    }
  }

  async findLogs(filters) {
    try {
      let query = `
        SELECT *
        FROM provisioning_logs
        WHERE 1=1
      `;
      const params = [];

      if (filters.startDate) {
        params.push(filters.startDate);
        query += ` AND created_at >= $${params.length}`;
      }

      if (filters.endDate) {
        params.push(filters.endDate);
        query += ` AND created_at <= $${params.length}`;
      }

      if (filters.user) {
        params.push(filters.user);
        query += ` AND created_by = $${params.length}`;
      }

      query += ' ORDER BY created_at DESC';

      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch provisioning logs', error);
    }
  }

  async findResults(logId) {
    try {
      const { rows } = await db.query(
        `SELECT *
        FROM provisioning_results
        WHERE log_id = $1
        ORDER BY created_at ASC`,
        [logId]
      );
      return rows;
    } catch (error) {
      throw new DatabaseError('Failed to fetch provisioning results', error);
    }
  }
}

module.exports = new ProvisioningModel();