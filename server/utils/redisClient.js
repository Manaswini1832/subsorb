import Redis from "ioredis";
import dotenv from 'dotenv';
dotenv.config();

export const redisClient = new Redis(
  process.env.SERVER_REDIS_URL
);