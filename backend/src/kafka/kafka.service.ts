import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { kafka } from './kafka.provider';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'nest-app',
      brokers: ['localhost:9092'],
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'notification-service' });
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();
    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [
        { topic: 'submission-events', numPartitions: 1, replicationFactor: 1 },
      ],
    });
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

  async subscribe(
    topic: string,
    handler: (key: string, value: any) => Promise<void>,
  ) {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const key = message.key?.toString() || '';
        const value = JSON.parse(message.value?.toString() || '{}');
        await handler(key, value);
      },
    });
  }
}
