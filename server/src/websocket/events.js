const EventEmitter = require('events');

class WebSocketEvents extends EventEmitter {
  constructor() {
    super();
    this.PROJECT_UPDATED = 'project_updated';
    this.PROVISIONING_STATUS = 'provisioning_status';
    this.SYSTEM_NOTIFICATION = 'system_notification';
  }

  emitProjectUpdate(project) {
    this.emit(this.PROJECT_UPDATED, {
      type: this.PROJECT_UPDATED,
      data: project
    });
  }

  emitProvisioningStatus(status) {
    this.emit(this.PROVISIONING_STATUS, {
      type: this.PROVISIONING_STATUS,
      data: status
    });
  }

  emitSystemNotification(notification) {
    this.emit(this.SYSTEM_NOTIFICATION, {
      type: this.SYSTEM_NOTIFICATION,
      data: notification
    });
  }
}

module.exports = new WebSocketEvents(); 