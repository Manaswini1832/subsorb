import { Kafka } from 'kafkajs';

const kafkaClient = new Kafka({
  clientId: 'subsorb-embedding-queue',
  brokers: ['localhost:9092'],
});

export const producer = kafkaClient.producer();

export const consumer = kafkaClient.consumer({
  groupId: 'embedding-group',
});