import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'campaign-service',
  brokers: ['localhost:9092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'notification-service' });

export async function connectKafka() {
  await producer.connect();
  await consumer.connect();
}
