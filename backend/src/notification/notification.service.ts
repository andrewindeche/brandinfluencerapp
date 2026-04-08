import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaService.subscribeToTopics([
        {
          topic: 'submission-events',
          handler: async (key, payload) => {
            switch (key) {
              case 'submission.created':
                this.notificationGateway.sendToBrand(payload.brandId, {
                  key,
                  payload: {
                    ...payload,
                    campaignTitle: payload.campaignTitle || 'Campaign',
                  },
                });
                break;

              case 'submission.accepted':
              case 'submission.rejected':
                this.notificationGateway.sendToInfluencer(payload.influencerId, {
                  key,
                  payload,
                });
                break;
            }
          },
        },
        {
          topic: 'campaign-invite',
          handler: async (key, payload) => {
            switch (key) {
              case 'campaign.invited':
                this.notificationGateway.sendToInfluencer(payload.influencerId, {
                  key,
                  payload: {
                    ...payload,
                    campaignTitle: payload.campaignTitle || 'Campaign',
                  },
                });
                break;

              case 'campaign.invite_accepted':
              case 'campaign.invite_rejected':
                this.notificationGateway.sendToBrand(payload.brandId, {
                  key,
                  payload,
                });
                break;
            }
          },
        },
        {
          topic: 'brand-actions',
          handler: async (key, payload) => {
            console.log('[NotificationService] Received brand-actions Kafka message:', key, payload);
            switch (key) {
              case 'influencer.accepted':
              case 'influencer.rejected':
                this.notificationGateway.sendToInfluencer(payload.influencerId, {
                  key,
                  payload,
                });
                break;
            }
          },
        },
      ]);
      
      this.logger.log('All Kafka topics subscribed');
    } catch (error) {
      this.logger.error('Failed to subscribe to Kafka topics', error);
    }
  }
}
