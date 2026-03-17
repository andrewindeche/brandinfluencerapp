import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notificationGateway: NotificationGateway
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe(
      'submission-events',
      async (key, payload) => {
        console.log('Kafka event received:', key, payload);
        switch (key) {
          case 'submission.created':
             this.notificationGateway.sendToUser(payload.brandId, {
              key,
              payload,
            break;
          case 'submission.accepted':
            break;
          case 'submission.rejected':
            break;
        }
      },
    );
  }
}
