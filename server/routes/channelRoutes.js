import express from 'express'
import axios from 'axios'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/', authChecker, async (req, res) => {
    try {
        if(!res.locals?.authenticated){
          return res
            .status(401)
            .json(createErrorObject('Unauthorized: authentication required.'));
        }

        const channelHandle = req.body.channelHandle
        if(!channelHandle || channelHandle == ""){
          return res
            .status(400)
            .json(createErrorObject('Invalid channel handle'));
        }
  
        //Call Youtube API
        const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=%40${channelHandle}&key=${process.env.SERVER_YOUTUBE_API_KEY}`
        const { data: ytData, error: ytError } = await axios.get(url);
  
        if (ytError) {
          return res
            .status(500)
            .json(createErrorObject(ytError.message));
        }
  
        if(ytData.pageInfo.totalResults == 0){
          return res
            .status(400)
            .json(createErrorObject('Invalid channel handle'));
        }
        const channelDetails = JSON.stringify(ytData);
        
        const token = req.header('Authorization')?.split(' ')[1];
        if(!token){
            return res
            .status(400)
            .json(createErrorObject('Missing or invalid authorization token.'));
        }

        let supabaseURL = '';
        let supabase_anon_pub_key = '';

        if (process.env.SERVER_SUPABASE_ENVIRONMENT === "PROD") {
            supabaseURL = process.env.SERVER_SUPABASE_PROJECT_URL_PROD;
            supabase_anon_pub_key = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_PROD;
        } else {
            supabaseURL = process.env.SERVER_SUPABASE_PROJECT_URL_DEV;
            supabase_anon_pub_key = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_DEV;
        }

        const supabase2 = createClient(
          supabaseURL,
          supabase_anon_pub_key,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          },
        );

        const { data: supabaseData, error: supabaseError } = await supabase2
          .from('Channels')
          .insert({ handle: channelHandle, details: channelDetails })
          .select();
  
        if(supabaseError){
            res
              .status(500)
              .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
            return;
        }
    
        return res
                  .status(201)
                  .json(supabaseData);
  
    } catch (error) {
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
  });
  
  export default router;