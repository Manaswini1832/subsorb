import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from "../utils/getSupabaseClient.js"
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post("/", authChecker, async(req, res) => {
    try {
        if(!res.locals?.authenticated){
          return res
            .status(401)
            .json(createErrorObject('Unauthorized: authentication required.'));
        }

        //user input from reqyest body
        const moodInput = req.body.moodInput;
        if(!moodInput || moodInput == ""){
          return res
            .status(400)
            .json(createErrorObject('Invalid mood input'));
        }

        //get token from auth headerr
        const token = req.header('Authorization')?.split(' ')[1];
        if(!token){
            return res
            .status(400)
            .json(createErrorObject('Missing or invalid authorization token.'));
        }

        //openaiclient create
        const openAIClient = new OpenAI({
            apiKey: process.env.SERVER_OPENAI_API_KEY_PROD,
        });
        
        //create moodinputembedding
        const openAIResponse = await openAIClient.embeddings.create({
            input : moodInput,
            model: 'text-embedding-3-small',
        })

        const supabase2 = getSupabaseClient(token); //get token
        const { data: moodInputData } =
            await supabase2.rpc("match_user_channels", {
                query_embedding:
                    openAIResponse.data[0].embedding,
                match_threshold : 0.4,
                match_count: 10,
                target_user_id: res.locals.decoded.payload.sub
            });

        //console.log(openAIResponse.data[0].embedding)

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
        console.log("Mood routes issue, ", error.message);
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
})

export default router;