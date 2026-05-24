import express from 'express'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

import collectionRoutes from './routes/collectionRoutes.js'
import channelRoutes from './routes/channelRoutes.js'
import collectionChannelRoutes from './routes/collectionChannelRoutes.js'
import moodRoutes from './routes/moodRoutes.js'

import { producer, consumer } from "./utils/kafkaClient.js";
import startEmbeddingConsumer from './utils/startEmbeddingConsumer.js';


const app = express()

async function startServer() {
  await producer.connect(); //global kafka producer
  await consumer.connect(); //global kafka consumer

  await consumer.subscribe({
    topic: 'embedding-topic',
    fromBeginning: false,
  });

  await startEmbeddingConsumer(); //kafka consumer that does openai chan embedding

  app.use(cors())
  app.use(express.json())

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');


  //serve frontend static files
  app.use(express.static(clientBuildPath))


  app.use('/api/v1/collections', collectionRoutes)
  app.use('/api/v1/channels', channelRoutes)
  app.use('/api/v1/collection-channels', collectionChannelRoutes)
  app.use('/api/v1/mood', moodRoutes)

  // other routes should serve the frontend
  app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });

  app.listen(process.env.SERVER_PORT, () => {
      console.log("App listening")
  })

}

startServer();