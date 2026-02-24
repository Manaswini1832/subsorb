import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from "../utils/getSupabaseClient.js"
import dotenv from 'dotenv';
import getYoutubeChannelDetails from '../utils/getYoutubeChannelDetails.js'
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
        const ytData = await getYoutubeChannelDetails(channelHandle);
        if(!ytData.data){
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

        
        const channelDetails = JSON.stringify(ytData.data);
        
        const token = req.header('Authorization')?.split(' ')[1];
        if(!token){
            return res
            .status(400)
            .json(createErrorObject('Missing or invalid authorization token.'));
        }

        const supabase2 = getSupabaseClient(token);

        const now = new Date().toISOString();
        const { data: supabaseData, error: supabaseError } = await supabase2
          .from('Channels')
          .insert({ handle: channelHandle, details: channelDetails, updated_at: now })
          .select();
  
        if(supabaseError){
            res
              .status(500)
              .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
            return;
        }
    
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
        console.log("Channel routes issue, ", error.message);
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
  });
  
  export default router;