const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map to store client connections

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  async handleConnection(ws, req) {
    try {
      // Extract token from query string
      const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
      if (!token) {
        throw new Error('Authentication token required');
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      const userId = decoded.id;

      // Store client connection
      this.clients.set(userId, ws);

      // Setup event handlers
      ws.on('message', (message) => this.handleMessage(userId, message));
      ws.on('close', () => this.handleClose(userId));
      ws.on('error', (error) => this.handleError(userId, error));

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        userId
      }));

      logger.info(`WebSocket client connected: ${userId}`);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication failed'
      }));
      ws.close();
    }
  }

  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      logger.debug(`Received message from ${userId}:`, data);

      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          this.handleSubscribe(userId, data);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(userId, data);
          break;
        default:
          logger.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('Error handling message:', error);
    }
  }

  handleClose(userId) {
    this.clients.delete(userId);
    logger.info(`WebSocket client disconnected: ${userId}`);
  }

  handleError(userId, error) {
    logger.error(`WebSocket error for client ${userId}:`, error);
  }

  // Broadcast message to specific users
  broadcast(userIds, message) {
    userIds.forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Broadcast message to all connected clients
  broadcastAll(message) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

module.exports = WebSocketServer; 