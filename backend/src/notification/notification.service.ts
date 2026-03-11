import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    await this.kafkaService.subscribe('submission-events', async (key, payload) => {
      switch (key) {
        case 'submission.created':
          break;
        case 'submission.accepted':
          break;
        case 'submission.rejected':
          break;
      }
    });
  }
}
