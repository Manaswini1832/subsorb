import { Kafka, Producer, Consumer } from "kafkajs";

const kafkaClient: Kafka = new Kafka({
  clientId: "subsorb-embedding-queue",
  brokers: ["localhost:9092"],
});

export const producer: Producer = kafkaClient.producer();

export const consumer: Consumer = kafkaClient.consumer({
  groupId: "embedding-group",
});
