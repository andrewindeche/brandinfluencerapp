import { Kafka } from 'kafkajs';

export const createKafkaInstance = (brokers: string[], clientId: string) => {
  return new Kafka({
    clientId,
    brokers,
  });
};

export const getKafkaBrokers = (): string[] => {
  const brokersEnv = process.env.KAFKA_BROKERS;
  if (brokersEnv) {
    return brokersEnv.split(',').map((b) => b.trim());
  }
  return ['localhost:9092'];
};

export const getKafkaClientId = (): string => {
  return process.env.KAFKA_CLIENT_ID || 'campaign-service';
};

export const kafka = createKafkaInstance(getKafkaBrokers(), getKafkaClientId());

export const createProducer = () => kafka.producer();
export const createConsumer = (groupId: string) => kafka.consumer({ groupId });
