import { BehaviorSubject } from 'rxjs';
import { NotificationType } from '../interfaces';

const notifications$ = new BehaviorSubject<NotificationType[]>([]);
const influencerNotifications$ = new BehaviorSubject<NotificationType[]>([]);
const brandNotifications$ = new BehaviorSubject<NotificationType[]>([]);

const typeMap = {
  'submission.accepted': 'accepted',
  'submission.rejected': 'rejected',
  'submission.created': 'new_submission',
} as const;

type KafkaKey = keyof typeof typeMap;

export const notificationStore = {
  notifications$,
  influencerNotifications$,
  brandNotifications$,
  clearNotifications() {
    notifications$.next([]);
    brandNotifications$.next([]);
    influencerNotifications$.next([]);
  },

  addNotification(notification: NotificationType) {
    const current = notifications$.getValue();

    const exists = current.some((n) => n.id === notification.id);
    if (exists) return;

    notifications$.next([notification, ...current]);
  },

  addInfluencerNotification(notification: NotificationType) {
    const current = influencerNotifications$.getValue();
    influencerNotifications$.next([notification, ...current]);
  },

  addBrandNotification(notification: NotificationType) {
    console.log('[NotificationStore] Adding brand notification:', notification);
    const current = brandNotifications$.getValue();
    brandNotifications$.next([notification, ...current]);
  },

  removeNotification(id: string) {
    const current = notifications$.getValue();
    notifications$.next(current.filter((n) => n.id !== id));

    const brandCurrent = brandNotifications$.getValue();
    brandNotifications$.next(brandCurrent.filter((n) => n.id !== id));

    const influencerCurrent = influencerNotifications$.getValue();
    influencerNotifications$.next(influencerCurrent.filter((n) => n.id !== id));
  },

  handleKafkaEvent(key: string, payload: any) {
    console.log('[NotificationStore] handleKafkaEvent called with key:', key, 'payload:', payload);
    
    if (!payload || !(key in typeMap)) {
      console.warn('[NotificationStore] Invalid event - missing payload or unknown key:', key);
      return;
    }

    const typedKey = key as KafkaKey;

    const notification: NotificationType = {
      id: payload.submissionId || crypto.randomUUID(),

      type: typeMap[typedKey],

      campaignId: payload.campaignId,
      submissionId: payload.submissionId,
      influencerId: payload.influencerId,
      brandId: payload.brandId,

      campaignTitle: payload.campaignTitle || 'Campaign',

      message:
        payload.message ||
        (typedKey === 'submission.accepted'
          ? 'Your submission was accepted 🎉'
          : typedKey === 'submission.rejected'
            ? 'Your submission was rejected'
            : `New submission received`),

      timestamp: payload.timestamp || Date.now().toString(),
      date: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    };

    switch (typedKey) {
      case 'submission.accepted':
      case 'submission.rejected':
        this.addNotification(notification);
        this.addInfluencerNotification(notification);
        break;

      case 'submission.created':
        this.addNotification(notification);
        this.addBrandNotification(notification);
        break;
    }
  },
};
