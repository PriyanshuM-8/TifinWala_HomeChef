import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ChefSocketService {
  constructor() {
    this.socket = null;
    this.joinedUserIds = [];
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        if (this.joinedUserIds.length > 0) {
          this.joinedUserIds.forEach((id) => {
            if (id) {
              this.socket.emit('join_user', id);
              this.socket.emit('join', id);
              this.socket.emit('join_chef', id);
            }
          });
        }
      });
    }
    return this.socket;
  }

  joinChefUser(userId, profileId = null) {
    const ids = [];
    if (Array.isArray(userId)) {
      ids.push(...userId.filter(Boolean));
    } else {
      if (userId) ids.push(userId);
      if (profileId) ids.push(profileId);
    }

    if (ids.length === 0) return;
    this.joinedUserIds = Array.from(new Set(ids.map((id) => id.toString())));

    const s = this.connect();
    if (s.connected) {
      this.joinedUserIds.forEach((id) => {
        s.emit('join_user', id);
        s.emit('join', id);
        s.emit('join_chef', id);
      });
    }
  }

  onNewOrder(callback) {
    const s = this.connect();
    s.on('new_order', callback);
    return () => {
      s.off('new_order', callback);
    };
  }

  onOrderStatusUpdated(callback) {
    const s = this.connect();
    s.on('order_status_updated', callback);
    return () => {
      s.off('order_status_updated', callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedUserIds = [];
    }
  }
}

export const socketService = new ChefSocketService();
export default socketService;
