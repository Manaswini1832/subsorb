import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from "../utils/getSupabaseClient.js"
import OpenAI from "openai";
import dotenv from 'dotenv';
import {rateLimiter} from "../middleware/rateLimit.js"
import logger from '../utils/logger.js'
dotenv.config();

const router = express.Router();

router.post("/", authChecker, rateLimiter, async(req, res) => {
    try {
        if(!res?.locals?.authenticated){
        logger.error('Unauthorized user tried to ask mood recs : Authentication required')
          return res
            .status(401)
            .json(createErrorObject('Unauthorized: authentication required.'));
        }

        //get token from auth headerr
        const token = req?.header('Authorization')?.split(' ')[1];
        if(!token){
            logger.error('Missing or invalid authorization token sent while asking mood recs')
            return res
            .status(400)
            .json(createErrorObject('Missing or invalid authorization token.'));
        }

        //user input from reqyest body
        const moodInput = req?.body?.moodInput;
        
        if(!moodInput || moodInput == "" || moodInput.length > 200){
        logger.error('User : ' + res?.locals?.decoded?.payload?.sub + ' asked for empty rec');
          return res
            .status(400)
            .json(createErrorObject('Invalid mood input'));
        }

        logger.info('User : ' + res?.locals?.decoded?.payload?.sub + ' asked for rec : ' + moodInput)

        //openaiclient create
        const openAIClient = new OpenAI({
            apiKey: process.env.SERVER_OPENAI_API_KEY_PROD,
        });
        
        //create moodinputembedding
        const openAIResponse = await openAIClient.embeddings.create({
            input : moodInput,
            model: 'text-embedding-3-small',
        })

        logger.info('User : ' + res?.locals?.decoded?.payload?.sub + ' mood embedding generated');

        const supabase2 = getSupabaseClient(token); //get token
        const { data: moodInputData } =
            await supabase2.rpc("match_user_channels", {
                query_embedding:
                    openAIResponse.data[0].embedding,
                match_threshold : 0.3,
                match_count: 5,
                target_user_id: res.locals.decoded.payload.sub
            });

        logger.info('Successfully fetched recs for user : ' + res?.locals?.decoded?.payload?.sub)

        return res
                  .status(201)
                  .json({
                      success: true,
                      message: "Search executed successfully",
                      data: moodInputData,
                      error: null,
                      meta: {
                        timestamp: new Date().toISOString()
                      }
                  });

    } catch (error) {
        logger.error("Mood routes server issue, " + error.message);
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
})

export default router;