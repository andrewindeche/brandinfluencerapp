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
    const current = brandNotifications$.getValue();
    brandNotifications$.next([notification, ...current]);
  },

  handleKafkaEvent(key: string, payload: any) {
    if (!payload || !(key in typeMap)) return;

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
