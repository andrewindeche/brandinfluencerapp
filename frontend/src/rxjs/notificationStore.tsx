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

export const notificationStore = {
  notifications$,
  influencerNotifications$,
  brandNotifications$,

  addNotification(notification: NotificationType) {
    notifications$.next([notification, ...notifications$.getValue()]);
  },

  addInfluencerNotification(notification: NotificationType) {
    influencerNotifications$.next([
      notification,
      ...influencerNotifications$.getValue(),
    ]);
  },

  addBrandNotification(notification: NotificationType) {
    brandNotifications$.next([notification, ...brandNotifications$.getValue()]);
  },

  handleKafkaEvent(key: string, payload: any) {
    if (!payload || !(key in typeMap)) return;

    const base: NotificationType = {
      id: crypto.randomUUID(),
      type: typeMap[key as keyof typeof typeMap],
      campaignId: payload.campaignId,
      submissionId: payload.submissionId,
      influencerId: payload.influencerId,
      brandId: payload.brandId,
      timestamp: Date.now().toString(),
      date: new Date(),
      message: '',
      campaignTitle: '',
    };

    switch (key) {
      case 'submission.accepted':
        base.message = `Your submission ${payload.submissionId} was accepted.`;
        this.addNotification(base);
        this.addInfluencerNotification(base);
        break;

      case 'submission.rejected':
        base.message = `Your submission ${payload.submissionId} was rejected.`;
        this.addNotification(base);
        this.addInfluencerNotification(base);
        break;

      case 'submission.created':
        base.message = `New submission ${payload.submissionId} received for campaign ${payload.campaignId}.`;
        this.addNotification(base);
        this.addBrandNotification(base);
        break;
    }
  },
};
