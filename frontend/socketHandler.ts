import { io, Socket } from 'socket.io-client';
import { notificationStore } from '@/rxjs/notificationStore';
import { authStore } from '@/rxjs/authStore';
import { submissions$ } from '@/rxjs/submissionStore';

class SocketHandler {
  private socket: Socket | null = null;
  private isConnecting = false;

  connect() {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    this.socket = io('http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;

      this.joinUserRooms();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      this.isConnecting = false;
    });

    this.socket.on('submission-event', (data) => {
      const key = data?.key;
      const payload = data?.payload || data;
      if (!key || !payload) {
        console.warn('[SocketHandler] Invalid socket event - missing key or payload', data);
        return;
      }
      notificationStore.handleKafkaEvent(key, payload);

      if (payload.campaignId && payload.submissionId) {
        const current = submissions$.getValue();
        const campaignSubs = current[payload.campaignId] || [];

        const updatedSubs = campaignSubs.map((s) =>
          s._id === payload.submissionId
            ? { ...s, status: payload.status }
            : s,
        );

        submissions$.next({
          ...current,
          [payload.campaignId]: updatedSubs,
        });
      }
    });
  }

  disconnect() {
    if (!this.socket) return;

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.isConnecting = false;
  }

  private joinUserRooms() {
    const authUser = authStore.getCurrentUser();
    let userId: string | undefined = authUser?.id;
    let userRole = authUser?.role;

    if (!userId) {
      const storedId = localStorage.getItem('userId');
      if (storedId) {
        userId = storedId;
      }
    }

    if (!userRole || userRole === 'unknown') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userRole = userObj.role;
        } catch (e) {}
      }
    }

    if (!userRole || userRole === 'unknown') {
      const storedUserType = localStorage.getItem('userType');
      if (storedUserType === 'brand' || storedUserType === 'influencer') {
        userRole = storedUserType;
      }
    }

    if (!userId || !userRole || userRole === 'unknown') {
      return;
    }
    if (userRole === 'influencer') {
      this.socket?.emit('join-influencer', userId);
    }

    if (userRole === 'brand') {
      this.socket?.emit('join-brand', userId);
    }
  }

  rejoinRooms() {
    if (!this.socket?.connected) return;
    this.joinUserRooms();
  }
}

export const socketHandler = new SocketHandler();