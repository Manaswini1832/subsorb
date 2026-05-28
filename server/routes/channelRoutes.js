import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from "../utils/getSupabaseClient.js"
import dotenv from 'dotenv';
import getYoutubeChannelDetails from '../utils/getYoutubeChannelDetails.js'
import {rateLimiter} from "../middleware/rateLimit.js"
import logger from '../utils/logger.js'
import { databaseResponseTimeHistogram } from '../utils/metrics.js';
dotenv.config();

const router = express.Router();

router.post('/', authChecker, rateLimiter, async (req, res) => {
  /*
  |--------------------------------------------------------------------------
  | Metrics
  |--------------------------------------------------------------------------
  */
  const metricsLabels = {
    operation : 'getChannels'
  }

  const timer = databaseResponseTimeHistogram.startTimer();

  /*
  |--------------------------------------------------------------------------
  | Actual logic
  |--------------------------------------------------------------------------
  */

  try {
      if(!res?.locals?.authenticated){
        logger.error('Unauthorized user tried to add a channel : Authentication required');
        timer({...metricsLabels, success: false});
        return res
          .status(401)
          .json(createErrorObject('Unauthorized: authentication required.'));
      }

      const token = req.header('Authorization')?.split(' ')[1];
      if(!token){
          logger.error('Missing or invalid authorization token sent while adding a channel');
          timer({...metricsLabels, success: false});
          return res
          .status(400)
          .json(createErrorObject('Missing or invalid authorization token.'));
      }

      const channelHandle = req?.body?.channelHandle
      if(!channelHandle || channelHandle == ""){
        logger.error('User : ' + res?.locals?.decoded?.payload?.sub + ' sent an empty/invalid channel handle');
        timer({...metricsLabels, success: false});
        return res
          .status(400)
          .json(createErrorObject('Invalid channel handle'));
      }

      //Call Youtube API
      const ytData = await getYoutubeChannelDetails(channelHandle, token);
      if(!ytData.data){
        logger.error('Received channel details but it was a failure!');
        timer({...metricsLabels, success: false});
        return  res
                .status(ytData.status)
                .json({
                    success: false,
                    message: ytData.message,
                    data: null,
                    error: ytData.message,
                    meta: {
                      timestamp: new Date().toISOString()
                    }
                });
                
      }

      logger.info('Successfully fetched and received youtube channel details from YouTube API');

      const channelDetails = JSON.stringify(ytData.data);
      const channelDetailsAIData = JSON.stringify(ytData.aiData)
      const channelDetailsAITags =
        typeof ytData.aiTags === "string"
          ? JSON.parse(ytData.aiTags)
          : ytData.aiTags;
      // const channelEmbedding = ytData.channelEmbedding

      const supabase2 = getSupabaseClient(token);

      const now = new Date().toISOString();
      const { data: supabaseData, error: supabaseError } = await supabase2
        .from('Channels')
        .insert({ 
          handle: channelHandle, 
          details: channelDetails, 
          ai_summary : channelDetailsAIData, 
          ai_tags : channelDetailsAITags, 
          // embedding: channelEmbedding,
          updated_at: now })
        .select();

      if(supabaseError){
          logger.error('Couldn\'t add channel details to database : ' + supabaseError?.message);
          timer({...metricsLabels, success: false});
          res
            .status(500)
            .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
          return;
      }
  
      logger.info('Channel details of : ' + channelHandle + ' successfully added to database');
      timer({...metricsLabels, success: true});
      return res
                .status(201)
                .json({
                    success: true,
                    message: "Channel fetched successfully",
                    data: supabaseData,
                    error: null,
                    meta: {
                      timestamp: new Date().toISOString()
                    }
                });

  } catch (error) {
      logger.error("Channel routes server error :  " + error.message);
      timer({...metricsLabels, success: false});
      return res
            .status(500)
            .json(createErrorObject('SERVER ERROR : ' + error.message));
  }
});

export default router;