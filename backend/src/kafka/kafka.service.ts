import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { kafka, createProducer, createConsumer } from './kafka.provider';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private readonly producer = createProducer();
  private readonly consumer = createConsumer(
    process.env.KAFKA_GROUP_ID || 'notification-service',
  );

  private isRunning = false;
  private subscribedTopics = new Map<string, (key: string, payload: any) => Promise<void>>();

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');

      await this.consumer.connect();
      this.logger.log('Kafka consumer connected');

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
        this.logger.log('Created submission-events topic');
      }

      await admin.disconnect();
    } catch (error) {
      this.logger.error('Failed to initialize Kafka', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Kafka disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka', error);
    }
  }

  async sendMessage(topic: string, key: string, value: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(value) }],
      });
      this.logger.debug(`Message sent to ${topic}: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to send message to ${topic}`, error);
      throw error;
    }
  }

  async testKafka() {
    return this.sendMessage('submission-events', 'submission.accepted', {
      campaignId: '123',
      brandId: 'b1',
      influencerId: 'i1',
    });
  }

  async subscribeToTopic(
    topic: string,
    handler: (key: string, payload: any) => Promise<void>,
  ) {
    if (this.subscribedTopics.has(topic)) {
      this.logger.warn(`Topic ${topic} already subscribed`);
      return;
    }

    try {
      await this.consumer.subscribe({
        topic,
        fromBeginning: false,
      });

      this.subscribedTopics.set(topic, handler);
      this.logger.log(`Subscribed to topic: ${topic}`);

      await this.runConsumer();
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}`, error);
      throw error;
    }
  }

  private async runConsumer() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        try {
          const key = message.key?.toString() || '';
          const value = JSON.parse(message.value?.toString() || '{}');

          this.logger.debug(`Received message on ${topic}: ${key}`);

          for (const [subscribedTopic, handler] of this.subscribedTopics) {
            if (subscribedTopic === topic) {
              await handler(key, value);
            }
          }
        } catch (err) {
          this.logger.error('Error processing Kafka message:', err);
        }
      },
    });

    this.logger.log('Kafka consumer started');
  }
}
