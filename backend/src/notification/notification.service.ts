import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribeToTopic(
      'submission-events',
      async (key, payload) => {
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
    );
  }
}
