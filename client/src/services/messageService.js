// NEW FILE - Message Service Layer
class MessageService {
  constructor() {
    this.pendingMessages = new Map();
    this.messageCallbacks = new Map();
  }

  async sendGroupMessage(socket, groupId, message, onProgress) {
    return new Promise((resolve, reject) => {
      const messageId = Date.now();
      
      // Store pending for retry
      this.pendingMessages.set(messageId, { groupId, message, retries: 0 });
      
      // Set timeout
      const timeout = setTimeout(() => {
        this.retryMessage(socket, messageId, resolve, reject);
      }, 10000);
      
      socket.emit("sendGroupMessage", { groupId, message }, (response) => {
        clearTimeout(timeout);
        this.pendingMessages.delete(messageId);
        
        if (response?.success) {
          resolve(response.message);
        } else {
          reject(response?.error);
        }
      });
    });
  }
  
  async retryMessage(socket, messageId, resolve, reject) {
    const pending = this.pendingMessages.get(messageId);
    if (!pending) return;
    
    pending.retries++;
    
    if (pending.retries >= 3) {
      this.pendingMessages.delete(messageId);
      reject("Message failed after 3 retries");
      return;
    }
    
    // Retry after delay
    setTimeout(() => {
      this.sendGroupMessage(socket, pending.groupId, pending.message)
        .then(resolve)
        .catch(reject);
    }, 2000 * pending.retries);
  }
}

export default new MessageService();