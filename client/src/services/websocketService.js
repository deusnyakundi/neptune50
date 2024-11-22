class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  connect(token) {
    const wsUrl = `${process.env.REACT_APP_WS_URL}?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }

  handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
  }

  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const listeners = this.listeners.get(message.type) || [];
      listeners.forEach(callback => callback(message.data));
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  }

  handleClose() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  unsubscribe(eventType, callback) {
    const listeners = this.listeners.get(eventType) || [];
    this.listeners.set(
      eventType,
      listeners.filter(cb => cb !== callback)
    );
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService(); 