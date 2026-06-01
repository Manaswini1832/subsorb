import OpenAI from "openai";
import axios from "axios";
import dotenv from "dotenv";
import { producer } from "./kafkaClient.js";
import logger from "./logger.js";
import { databaseResponseTimeHistogram } from "./metrics.js";
import {
  YouTubeChannelDetailsResult,
  YouTubeChannelResponse,
  AIData,
} from "../types/youTube.js";

dotenv.config();

//call youtube api for youtube channel results
//call openai api for summary + tags
export default async function getYoutubeChannelDetails(
  channelHandle: string,
  token: string,
): Promise<YouTubeChannelDetailsResult> {
  /*
    |--------------------------------------------------------------------------
    | Metrics
    |--------------------------------------------------------------------------
    */
  const metricsLabels = {
    operation: "getYouTubeChannelDetails",
  };

  const timer = databaseResponseTimeHistogram.startTimer();

  /*
    |--------------------------------------------------------------------------
    | Actual logic
    |--------------------------------------------------------------------------
    */

  try {
    logger.info(
      "Getting youtube channel details for the handle : " + channelHandle,
    );
    const url: string = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=%40${channelHandle}&key=${process.env.SERVER_YOUTUBE_API_KEY}`;
    const response = await axios.get(url);

    logger.info(response);

    const ytData: YouTubeChannelResponse = response?.data;

    if (ytData.pageInfo.totalResults == 0) {
      logger.error(
        "User entered an invalid channel handle. Can't fetch channel from YouTube",
      );
      timer({ ...metricsLabels, success: 0 });
      return {
        status: 400,
        message: "Invalid channel handle",
        data: null,
        aiData: null,
        aiTags: null,
      };
    }

    logger.info(
      "Channel details for handle : " + channelHandle + " fetched successfully",
    );

    const openAIClient = new OpenAI({
      apiKey: process.env.SERVER_OPENAI_API_KEY_PROD,
    });

    const channelDescription = ytData.items?.[0]?.snippet?.description || "";

    logger.info(
      "Calling OpenAI LLM API with details of channel : " + channelHandle,
    );
    const openAIResponse = await openAIClient.responses.create({
      model: "gpt-5.5",
      input: `
            Return ONLY valid JSON in this exact format:

            {
            "summary": "2-3 line summary",
            "tags": ["tag1", "tag2", "tag3"]
            }

            Channel description:
            ${channelDescription}

            Channel handle:
            ${channelHandle}
            `,
    });

    const aiData: AIData = JSON.parse(openAIResponse.output_text);

    //put embedding message in kafka queue here
    //kafka producer
    logger.info(
      "Sending channel : " +
        channelHandle +
        " openAI data to kafka producer for async embedding",
    );
    await producer.send({
      topic: "embedding-topic",
      messages: [
        {
          value: JSON.stringify({
            aiTags: Array.isArray(aiData.tags) ? aiData.tags : [],
            aiDataSummary: aiData.summary ?? "",
            channelDescription,
            channelHandle,
            token,
            retryCount: 0,
          }),
        },
      ],
    });

    timer({ ...metricsLabels, success: 1 });
    return {
      status: 200,
      message: "Successfully fetched youtube channel details",
      data: ytData,
      aiData: aiData.summary,
      aiTags: aiData.tags,
    };
  } catch (e) {
    logger.error("Failed to fetch youtube channel details");
    timer({ ...metricsLabels, success: 0 });
    return {
      status: 500,
      message: e.message,
      data: null,
      aiData: null,
      aiTags: null,
    };
  }
}
