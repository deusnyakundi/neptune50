const db = require('../db');
const logger = require('../utils/logger');
const { redis } = require('../utils/redis');

class ProvisioningService {
  // Process bulk provisioning
  async processBulkProvisioning(file, userId) {
    try {
      // Start a database transaction
      const client = await db.pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Process the file and insert records
        const devices = await this.parseProvisioningFile(file);
        const results = [];
        
        for (const device of devices) {
          const result = await client.query(
            `INSERT INTO devices (
              serial_number, 
              model, 
              status,
              created_by,
              project_id,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
            RETURNING *`,
            [
              device.serialNumber,
              device.model,
              'pending',
              userId,
              device.projectId
            ]
          );
          
          results.push(result.rows[0]);
        }
        
        await client.query('COMMIT');
        return results;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Bulk provisioning error:', error);
      throw error;
    }
  }

  // Parse provisioning file
  async parseProvisioningFile(file) {
    try {
      // Implementation depends on file format (CSV, Excel, etc.)
      // For example, if CSV:
      const csv = require('csv-parse/sync');
      const content = file.buffer.toString();
      
      const records = csv.parse(content, {
        columns: true,
        skip_empty_lines: true
      });
      
      return records.map(record => ({
        serialNumber: record.serial_number,
        model: record.model,
        projectId: record.project_id
      }));
    } catch (error) {
      logger.error('File parsing error:', error);
      throw error;
    }
  }

  // Get provisioning status
  async getProvisioningStatus(batchId) {
    try {
      const status = await redis.get(`provisioning:${batchId}`);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      logger.error('Error getting provisioning status:', error);
      throw error;
    }
  }

  // Update provisioning status
  async updateProvisioningStatus(batchId, status) {
    try {
      await redis.setex(
        `provisioning:${batchId}`, 
        3600, // 1 hour expiry
        JSON.stringify(status)
      );
    } catch (error) {
      logger.error('Error updating provisioning status:', error);
      throw error;
    }
  }
}

module.exports = new ProvisioningService(); 