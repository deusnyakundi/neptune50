const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const hpp = require('hpp');

const securityMiddleware = [
  // Set security headers
  helmet(),
  
  // CORS configuration
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600, // 10 minutes
  }),
  
  // Prevent XSS attacks
  xss(),
  
  // Prevent HTTP Parameter Pollution
  hpp(),
  
  // Custom security middleware
  (req, res, next) => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
  },
];

module.exports = securityMiddleware; 