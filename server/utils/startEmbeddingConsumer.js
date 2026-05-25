import dotenv from 'dotenv';
import OpenAI from 'openai';

import { consumer, producer } from './kafkaClient.js';
import getSupabaseClient from './getSupabaseClient.js';
import logger from './logger.js';

dotenv.config();

const openAIClient = new OpenAI({
    apiKey: process.env.SERVER_OPENAI_API_KEY_PROD,
});

let consumerStarted = false;

//consuemer
//create embedding for this youtube channel based on ai generated tags
export default async function startEmbeddingConsumer() {

    if (consumerStarted) {
        return;
    }

    consumerStarted = true;

    await consumer.run({
        eachMessage: async ({ message }) => {

            logger.info('Hi I am the Kafka consumer');

            const parsedMessage = JSON.parse(
                message.value.toString()
            );

            try {

                const embeddingText = `
                    ${parsedMessage.aiDataSummary}

                    ${parsedMessage.aiTags.join(" ")}

                    ${parsedMessage.channelDescription}

                    ${parsedMessage.channelHandle}
                `;

                const embeddingResponse =
                    await openAIClient.embeddings.create({
                        input: embeddingText,
                        model: "text-embedding-3-small",
                    });
                
                logger.info('I have created a successful channel embedding for channel : ' + parsedMessage?.channelHandle);

                const channelEmbedding =
                    embeddingResponse.data[0].embedding;

                const supabase2 = getSupabaseClient(parsedMessage.token);

                const now = new Date().toISOString();

                const {
                    data,
                    error
                } = await supabase2
                    .from('Channels')
                    .update({
                        embedding: channelEmbedding,
                        updated_at: now
                    })
                    .eq(
                        'handle',
                        parsedMessage.channelHandle
                    )
                    .select();

                if (error) {
                    throw new Error(error.message);
                }


                logger.info("I successfully stored the channel embedding");
                logger.info("Bye from Kafka Consumer");

            } catch (err) {
                logger.error('I failed to update channel record with embedding information : ' + err.message);
            }
        },
    });
}