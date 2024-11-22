const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Device Provisioning API',
      version: '1.0.0',
      description: 'API documentation for the Device Provisioning System',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            description: { type: 'string' },
            region: { type: 'string' },
            msp: { type: 'string' },
            partner: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'on_hold'],
            },
            engineer: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ProvisioningLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            ticket_number: { type: 'string' },
            reason: { type: 'string' },
            total_devices: { type: 'integer' },
            processed_devices: { type: 'integer' },
            successful_devices: { type: 'integer' },
            failed_devices: { type: 'integer' },
            created_by: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

module.exports = swaggerJsdoc(options); 