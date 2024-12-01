import express from 'express'
import axios from 'axios'
import authChecker from '../middleware/authChecker.js'
import supabase from '../supabaseClient.js'
import createErrorObject from '../utils/error.js'

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
        const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=%40${channelHandle}&key=${process.env.SERVER_YOUTUBE_API_KEY}`
        const { data: ytData, error: ytError } = await axios.get(url);
  
        if (ytError) {
          res.status(500).json(createErrorObject(ytError))
          return
        }
  
        if(ytData.pageInfo.totalResults == 0){
          res.status(400).json(createErrorObject('Invalid channel handle'))
          return
        }
        const channelDetails = JSON.stringify(ytData)
  
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('Channels')
          .insert({ handle: channelHandle, details: channelDetails })
          .select()
  
        if (supabaseError) {
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
      const message = createErrorObject(error)
      res.status(500).json(message) // Internal server error (500)
      return
    }
  })
  
  export default router