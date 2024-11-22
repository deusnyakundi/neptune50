const prometheus = require('prom-client');
const os = require('os');
const db = require('../db');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const wsEvents = require('../websocket/events');

class MonitoringService {
  constructor() {
    // Initialize Prometheus metrics
    this.metrics = {
      httpRequestDuration: new prometheus.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.5, 1, 2, 5],
      }),

      activeConnections: new prometheus.Gauge({
        name: 'websocket_active_connections',
        help: 'Number of active WebSocket connections',
      }),

      dbQueryDuration: new prometheus.Histogram({
        name: 'db_query_duration_seconds',
        help: 'Duration of database queries in seconds',
        labelNames: ['query_type'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1],
      }),

      cacheHitRatio: new prometheus.Gauge({
        name: 'cache_hit_ratio',
        help: 'Cache hit ratio',
      }),

      systemMetrics: {
        cpuUsage: new prometheus.Gauge({
          name: 'system_cpu_usage',
          help: 'System CPU usage percentage',
        }),
        memoryUsage: new prometheus.Gauge({
          name: 'system_memory_usage',
          help: 'System memory usage in bytes',
        }),
        activeRequests: new prometheus.Gauge({
          name: 'system_active_requests',
          help: 'Number of active requests',
        }),
      },
    };

    // Initialize monitoring
    this.startMonitoring();
  }

  async startMonitoring() {
    // Collect metrics every 15 seconds
    setInterval(() => this.collectMetrics(), 15000);

    // Check system health every minute
    setInterval(() => this.checkSystemHealth(), 60000);
  }

  async collectMetrics() {
    try {
      // Collect system metrics
      const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
      const memoryUsage = process.memoryUsage().heapUsed;

      this.metrics.systemMetrics.cpuUsage.set(cpuUsage);
      this.metrics.systemMetrics.memoryUsage.set(memoryUsage);

      // Collect database metrics
      const dbMetrics = await this.collectDatabaseMetrics();
      
      // Collect cache metrics
      const cacheMetrics = await this.collectCacheMetrics();

      // Store metrics for historical analysis
      await this.storeMetrics({
        timestamp: new Date(),
        cpu: cpuUsage,
        memory: memoryUsage,
        db: dbMetrics,
        cache: cacheMetrics,
      });

      // Emit metrics update event
      wsEvents.emit('metrics_update', {
        type: 'metrics_update',
        data: {
          cpu: cpuUsage,
          memory: memoryUsage,
          db: dbMetrics,
          cache: cacheMetrics,
        },
      });
    } catch (error) {
      logger.error('Failed to collect metrics:', error);
    }
  }

  async collectDatabaseMetrics() {
    try {
      const { rows } = await db.query(`
        SELECT 
          (SELECT count(*) FROM pg_stat_activity) as active_connections,
          pg_database_size(current_database()) as database_size,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_queries
      `);

      return rows[0];
    } catch (error) {
      logger.error('Failed to collect database metrics:', error);
      return null;
    }
  }

  async collectCacheMetrics() {
    try {
      const info = await redis.info();
      return {
        usedMemory: info.used_memory,
        hitRate: info.keyspace_hits / (info.keyspace_hits + info.keyspace_misses),
        totalKeys: info.keys,
      };
    } catch (error) {
      logger.error('Failed to collect cache metrics:', error);
      return null;
    }
  }

  async storeMetrics(metrics) {
    try {
      await db.query(
        `INSERT INTO system_metrics 
        (timestamp, cpu_usage, memory_usage, db_metrics, cache_metrics)
        VALUES ($1, $2, $3, $4, $5)`,
        [
          metrics.timestamp,
          metrics.cpu,
          metrics.memory,
          metrics.db,
          metrics.cache,
        ]
      );
    } catch (error) {
      logger.error('Failed to store metrics:', error);
    }
  }

  async checkSystemHealth() {
    try {
      const healthStatus = {
        database: await this.checkDatabaseHealth(),
        cache: await this.checkCacheHealth(),
        system: await this.checkSystemResources(),
      };

      const overallHealth = Object.values(healthStatus).every(
        status => status.status === 'healthy'
      );

      if (!overallHealth) {
        this.triggerHealthAlert(healthStatus);
      }

      return {
        status: overallHealth ? 'healthy' : 'unhealthy',
        details: healthStatus,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to check system health:', error);
      return {
        status: 'unhealthy',
        details: error,
        timestamp: new Date(),
      };
    }
  }

  async checkDatabaseHealth() {
    // Implement database health check logic here
    return {
      status: 'healthy',
      details: {},
    };
  }

  async checkCacheHealth() {
    // Implement cache health check logic here
    return {
      status: 'healthy',
      details: {},
    };
  }

  async checkSystemResources() {
    // Implement system resources check logic here
    return {
      status: 'healthy',
      details: {},
    };
  }

  triggerHealthAlert(healthStatus) {
    // Implement health alert trigger logic here
  }
}

module.exports = MonitoringService; 