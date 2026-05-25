import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import collectionRoutes from './routes/collectionRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import collectionChannelRoutes from './routes/collectionChannelRoutes.js';
import moodRoutes from './routes/moodRoutes.js';

import logger from './utils/logger.js';

import { producer, consumer } from './utils/kafkaClient.js';
import startEmbeddingConsumer from './utils/startEmbeddingConsumer.js';

const app = express();

const PORT = process.env.SERVER_PORT || 5000;

/*
|--------------------------------------------------------------------------
| Express Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Static Frontend
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientBuildPath = path.join(__dirname, '..', 'client', 'build');

app.use(express.static(clientBuildPath));

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1/collection-channels', collectionChannelRoutes);
app.use('/api/v1/mood', moodRoutes);

/*
|--------------------------------------------------------------------------
| React Fallback Route
|--------------------------------------------------------------------------
*/

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

/*
|--------------------------------------------------------------------------
| Global Error Handlers
|--------------------------------------------------------------------------
*/

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

/*
|--------------------------------------------------------------------------
| Kafka Connection With Retry
|--------------------------------------------------------------------------
*/

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectKafka() {
  while (true) {
    try {
      logger.info('Connecting Kafka producer...');
      await producer.connect();

      logger.info('Kafka producer connected');

      logger.info('Connecting Kafka consumer...');
      await consumer.connect();

      logger.info('Kafka consumer connected');

      await consumer.subscribe({
        topic: 'embedding-topic',
        fromBeginning: false,
      });

      logger.info('Kafka consumer subscribed');

      startEmbeddingConsumer();

      logger.info('Embedding consumer started');

      break;
    } catch (error) {
      logger.error('Kafka startup failed:', error);

      logger.info('Retrying Kafka connection in 5 seconds...');

      await sleep(5000);
    }
  }
}

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);

  // Start Kafka in background
  connectKafka();
});