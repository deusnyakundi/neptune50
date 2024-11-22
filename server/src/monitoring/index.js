const prometheus = require('prom-client');
const responseTime = require('response-time');

// Create a Registry to register metrics
const register = new prometheus.Registry();

// Add default metrics (CPU, memory usage, etc.)
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const provisioningTotal = new prometheus.Counter({
  name: 'provisioning_total',
  help: 'Total number of device provisioning attempts',
  labelNames: ['status'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(provisioningTotal);

// Middleware to track request metrics
const metricsMiddleware = responseTime((req, res, time) => {
  if (req.path !== '/metrics') {
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(time / 1000);
    
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  }
});

module.exports = {
  register,
  metricsMiddleware,
  provisioningTotal,
}; 