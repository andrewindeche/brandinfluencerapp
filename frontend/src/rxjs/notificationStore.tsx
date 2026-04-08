import { BehaviorSubject } from 'rxjs';
import { NotificationType } from '../interfaces';

const notifications$ = new BehaviorSubject<NotificationType[]>([]);
const influencerNotifications$ = new BehaviorSubject<NotificationType[]>([]);
const brandNotifications$ = new BehaviorSubject<NotificationType[]>([]);

const typeMap = {
  'submission.accepted': 'accepted',
  'submission.rejected': 'rejected',
  'submission.created': 'new_submission',
  'campaign.invited': 'campaign_invite',
  'campaign.invite_accepted': 'campaign_invite_accepted',
  'campaign.invite_rejected': 'campaign_invite_rejected',
  'influencer.accepted': 'influencer_accepted',
  'influencer.rejected': 'influencer_rejected',
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
    const exists = current.some((n) => n.id === notification.id);
    if (exists) return;
    influencerNotifications$.next([notification, ...current]);
  },

  addBrandNotification(notification: NotificationType) {
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
    console.log('[NotificationStore] Received Kafka event:', key, payload);
    
    if (!key && payload?.key) {
      key = payload.key;
      payload = payload.payload || payload;
    }
    
    if (!payload || !(key in typeMap)) {
      console.log('[NotificationStore] Key not in typeMap:', key);
      return;
    }

    const typedKey = key as KafkaKey;

    const notification: NotificationType = {
      id: payload.submissionId || payload.campaignId || payload.influencerId || crypto.randomUUID(),
      type: typeMap[typedKey],
      campaignId: payload.campaignId,
      submissionId: payload.submissionId,
      influencerId: payload.influencerId,
      brandId: payload.brandId,
      brandName: payload.brandName,
      campaignTitle: typedKey === 'influencer.accepted' 
        ? `Brand: ${payload.brandName || 'a brand'}`
        : (payload.campaignTitle || 'Campaign'),
      message:
        payload.message ||
        (typedKey === 'submission.accepted'
          ? 'Your submission was accepted 🎉'
          : typedKey === 'submission.rejected'
            ? 'Your submission was rejected'
            : typedKey === 'campaign.invited'
              ? `You've been invited to join campaign: ${payload.campaignTitle || 'Campaign'}`
              : typedKey === 'campaign.invite_accepted'
                ? `Influencer accepted your campaign invitation`
                : typedKey === 'campaign.invite_rejected'
                  ? `Influencer declined your campaign invitation`
                  : typedKey === 'influencer.accepted'
                    ? `You've been accepted by ${payload.brandName || 'a brand'}! You can now join their campaigns.`
                    : typedKey === 'influencer.rejected'
                      ? `You've been rejected by a brand`
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

      case 'campaign.invited':
        this.addNotification(notification);
        this.addInfluencerNotification(notification);
        break;

      case 'campaign.invite_accepted':
      case 'campaign.invite_rejected':
        this.addNotification(notification);
        this.addBrandNotification(notification);
        break;

      case 'influencer.accepted':
      case 'influencer.rejected':
        this.addNotification(notification);
        this.addInfluencerNotification(notification);
        break;
    }
  },
};
