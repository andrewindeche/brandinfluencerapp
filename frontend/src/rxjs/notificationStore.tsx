import { BehaviorSubject } from 'rxjs';
import { NotificationType } from '../interfaces';

const notifications$ = new BehaviorSubject<NotificationType[]>([]);
const influencerNotifications$ = new BehaviorSubject<NotificationType[]>([]);
const brandNotifications$ = new BehaviorSubject<NotificationType[]>([]);

export const notificationStore = {
  notifications$,
  influencerNotifications$,
  brandNotifications$,
  addNotification(notification: NotificationType) {
    const current = notifications$.getValue();
    notifications$.next([notification, ...current]);
  },
  addInfluencerNotification(notification: NotificationType) {
    const current = influencerNotifications$.getValue();
    influencerNotifications$.next([notification, ...current]);
  },
  addBrandNotification(notification: NotificationType) {
    const current = brandNotifications$.getValue();
    brandNotifications$.next([notification, ...current]);
  },
};
