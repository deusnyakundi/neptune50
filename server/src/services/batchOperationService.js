const db = require('../db');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { DatabaseError } = require('../utils/errors');
const wsEvents = require('../websocket/events');

class BatchOperationService {
  constructor() {
    this.BATCH_STATUS = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
    };
  }

  async createBatchOperation(data) {
    const { type, items, userId, metadata = {} } = data;
    
    try {
      const { rows } = await db.query(
        `INSERT INTO batch_operations 
        (type, total_items, status, user_id, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [type, items.length, this.BATCH_STATUS.PENDING, userId, metadata]
      );

      const batchId = rows[0].id;
      
      // Store items in Redis for processing
      await redis.setex(
        `batch:${batchId}:items`,
        3600, // 1 hour expiry
        JSON.stringify(items)
      );

      // Start processing
      this.processBatch(batchId, type, items);

      return rows[0];
    } catch (error) {
      logger.error('Failed to create batch operation:', error);
      throw new DatabaseError('Failed to create batch operation');
    }
  }

  async processBatch(batchId, type, items) {
    try {
      await this.updateBatchStatus(batchId, this.BATCH_STATUS.PROCESSING);
      
      const results = {
        success: [],
        failed: [],
        total: items.length,
        processed: 0,
      };

      for (const item of items) {
        try {
          await this.processItem(type, item);
          results.success.push(item);
        } catch (error) {
          logger.error(`Failed to process item in batch ${batchId}:`, error);
          results.failed.push({ item, error: error.message });
        }

        results.processed++;
        
        // Update progress
        await this.updateBatchProgress(batchId, results.processed, results.total);
      }

      await this.completeBatch(batchId, results);
    } catch (error) {
      logger.error(`Batch operation ${batchId} failed:`, error);
    }
  }

  async updateBatchStatus(batchId, status) {
    try {
      await db.query(
        `UPDATE batch_operations SET status = $1 WHERE id = $2`,
        [status, batchId]
      );
    } catch (error) {
      logger.error(`Failed to update batch status for ${batchId}:`, error);
    }
  }

  async updateBatchProgress(batchId, processed, total) {
    try {
      await db.query(
        `UPDATE batch_operations SET processed_items = $1, total_items = $2 WHERE id = $3`,
        [processed, total, batchId]
      );
    } catch (error) {
      logger.error(`Failed to update batch progress for ${batchId}:`, error);
    }
  }

  async completeBatch(batchId, results) {
    try {
      await this.updateBatchStatus(batchId, this.BATCH_STATUS.COMPLETED);
      
      // Notify clients about the completion
      wsEvents.emit('batch_completed', batchId, results);
    } catch (error) {
      logger.error(`Failed to complete batch ${batchId}:`, error);
    }
  }

  async processItem(type, item) {
    // Implement item processing logic based on the type
  }
} 