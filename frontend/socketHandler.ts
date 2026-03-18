import { io, Socket } from 'socket.io-client';
import { notificationStore } from '@/rxjs/notificationStore';
import { authStore } from '@/rxjs/authStore';

class SocketHandler {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:4000', {
      autoConnect: true,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.joinUserRooms();
    });

    this.socket.on('disconnect', () => {
    });

    this.socket.on('submission-event', (data) => {
      const { key, payload } = data;

      notificationStore.handleKafkaEvent(key, payload);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket error:', err);
    });
  }

  disconnect() {
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
  }

  private joinUserRooms() {
    const user = authStore.getCurrentUser();

    if (!user || !user.role) {
      console.warn('⚠️ No user found for socket room join');
      return;
    }

    if (user.role === 'influencer') {
      this.socket?.emit('join-influencer', user.id);
    }

    if (user.role === 'brand') {
      this.socket?.emit('join-brand', user.id);
    }
  }
}

export const socketHandler = new SocketHandler();