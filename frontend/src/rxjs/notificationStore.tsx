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

  handleKafkaEvent(key: string, payload: any) {
    const base: NotificationType = {
      id: `${payload.submissionId}-${Date.now()}`,
      type: key as NotificationType['type'],
      campaignId: payload.campaignId,
      submissionId: payload.submissionId,
      influencerId: payload.influencerId,
      brandId: payload.brandId,
      timestamp: Date.now().toString(),
      date: new Date(),
      message: '',
      campaignTitle: ''
    };

    switch (key) {
      case 'submission.accepted':
        base.message = `Your submission ${payload.submissionId} was accepted.`;
        this.addInfluencerNotification(base);
        break;
      case 'submission.rejected':
        base.message = `Your submission ${payload.submissionId} was rejected.`;
        this.addInfluencerNotification(base);
        break;
      case 'submission.created':
        base.message = `New submission ${payload.submissionId} received for campaign ${payload.campaignId}.`;
        this.addBrandNotification(base);
        break;
    }
  },
};
