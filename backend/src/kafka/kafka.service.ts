import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { kafka, producer, consumer } from './kafka.provider';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer = producer;
  private consumer: Consumer = consumer;

  private isRunning = false;
  private subscribedTopics = new Set<string>();

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    const admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();

    if (!topics.includes('submission-events')) {
      await admin.createTopics({
        topics: [
          {
            topic: 'submission-events',
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
    }

    await admin.disconnect();

  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async sendMessage(topic: string, key: string, value: any) {
    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }],
    });
  }

  async testKafka() {
    return this.sendMessage('submission-events', 'submission.accepted', {
      campaignId: '123',
      brandId: 'b1',
      influencerId: 'i1',
    });
  }

  async subscribeToTopic(topic: string, p0: (key: any, payload: any) => Promise<void>) {
    if (this.subscribedTopics.has(topic)) return;

    await this.consumer.subscribe({
      topic,
      fromBeginning: false,
    });

    this.subscribedTopics.add(topic);
  }

  async runConsumer(
    handler: (key: string, value: any) => Promise<void>,
  ) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        try {
          const key = message.key?.toString() || '';
          const value = JSON.parse(
            message.value?.toString() || '{}',
          );
          await handler(key, value);
        } catch (err) {
          console.error('❌ Error processing Kafka message:', err);
        }
      },
    });
  }
}