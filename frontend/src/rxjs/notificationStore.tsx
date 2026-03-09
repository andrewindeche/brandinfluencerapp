import { BehaviorSubject } from 'rxjs';
import { NotificationType } from '../interfaces';

const notifications$ = new BehaviorSubject<NotificationType[]>([]);

export const notificationStore = {
  notifications$,
  addNotification(notification: NotificationType) {
    const current = notifications$.getValue();
    notifications$.next([notification, ...current]);
  },
};
