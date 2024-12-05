import express from 'express'
import axios from 'axios'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router()

router.post('/', authChecker, async (req, res) => {
    try {
      if(!res.locals?.authenticated){
        res.status(500).json(createErrorObject("Couldn't create channels. Try again later!"))
        return
      }
      if(res.locals.authenticated == true){
        const channelHandle = req.body.channelHandle
        if(!channelHandle || channelHandle == ""){
          res.status(400).json(createErrorObject('Invalid channel handle'))
          return
        }
  
        //Call Youtube API
        // const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=%40${channelHandle}&key=${process.env.SERVER_YOUTUBE_API_KEY}`
        // const { data: ytData, error: ytError } = await axios.get(url);
  
        // if (ytError) {
        //   res.status(500).json(createErrorObject(ytError))
        //   return
        // }
  
        // if(ytData.pageInfo.totalResults == 0){
        //   res.status(400).json(createErrorObject('Invalid channel handle'))
        //   return
        // }
        // const channelDetails = JSON.stringify(ytData)
        //TODO : Remove this in production and uncomment the top part. this is just to prevent overloading the YT API w requests during development
        const channelDetails = '{"kind":"youtube#channelListResponse","etag":"vrn8Ts8KByUxG3cUxqMX90dCJig","pageInfo":{"totalResults":1,"resultsPerPage":5},"items":[{"kind":"youtube#channel","etag":"UlepXkHyby5AoKpIRODsL7Gm_2k","id":"UC6biysICWOJ-C3P4Tyeggzg","snippet":{"title":"Low Level","description":"Yapping about cyber security, software security, and whatever else I find interesting.\n","customUrl":"@lowleveltv","publishedAt":"2020-10-19T01:32:23.748549Z","thumbnails":{"default":{"url":"https://yt3.ggpht.com/_-uDVuD6APPo5U_spZtnhliDrlBkKUV-YZznd9QTgnvaMrLx79Fv3WHXsR31ZXTfY8NkS5YLJg=s88-c-k-c0x00ffffff-no-rj","width":88,"height":88},"medium":{"url":"https://yt3.ggpht.com/_-uDVuD6APPo5U_spZtnhliDrlBkKUV-YZznd9QTgnvaMrLx79Fv3WHXsR31ZXTfY8NkS5YLJg=s240-c-k-c0x00ffffff-no-rj","width":240,"height":240},"high":{"url":"https://yt3.ggpht.com/_-uDVuD6APPo5U_spZtnhliDrlBkKUV-YZznd9QTgnvaMrLx79Fv3WHXsR31ZXTfY8NkS5YLJg=s800-c-k-c0x00ffffff-no-rj","width":800,"height":800}},"localized":{"title":"Low Level","description":"Yapping about cyber security, software security, and whatever else I find interesting.\n"},"country":"US"}}]}'
        console.log("channel details : ", channelDetails)
        
        //TODO : handle no token
        const token = req.header('Authorization')?.split(' ')[1]
        const supabase2 = createClient(
          process.env.SERVER_SUPABASE_PROJECT_URL,
          process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY,
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
          .select()
  
        if (supabaseError) {
          console.log(supabaseError)
          res.status(500).json(createErrorObject(supabaseError))
          return
        }
  
        res.status(200).json(supabaseData)
        return
  
      }else{
        const message = createErrorObject("Unauthorized to create channels")
        res.status(401).json(message)
        return
      }
    } catch (error) {
      console.log(error)
      const message = createErrorObject(error)
      res.status(500).json(message) // Internal server error (500)
      return
    }
  })
  
  export default router