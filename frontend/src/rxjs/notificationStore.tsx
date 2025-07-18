import { BehaviorSubject } from 'rxjs';

interface NotificationType {
  id: number;
  campaignTitle: string;
  type: 'submission' | 'status';
  message: string;
  timestamp: string;
}

const notifications$ = new BehaviorSubject<NotificationType[]>([]);

export const notificationStore = {
  notifications$,
  addNotification(notification: NotificationType) {
    const current = notifications$.getValue();
    notifications$.next([notification, ...current]);
  },
};
