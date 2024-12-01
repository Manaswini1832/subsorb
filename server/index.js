import express from 'express'
import axios from 'axios'
import authChecker from './middleware/authChecker.js'
import supabase from './supabaseClient.js'
import createErrorObject from './utils/error.js'

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//CHANNELS
app.post('/api/v1/channels', authChecker, async (req, res) => {
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

//COLLECTIONS
app.get('/api/v1/collections', authChecker, async (req, res) => {
  try {
    if(!res.locals?.authenticated){
      res.status(500).json(createErrorObject('Couldn\'t fetch collections. Try again later!'))
      return
    }

    if(res.locals.authenticated == true){
      const { data: supabaseData, error: supabaseError } = await supabase
                              .from('Collections')
                              .select('name')
                              .eq('user_id', res.locals.decoded.sub)
        
      if(supabaseError){
        res.status(500).json(createErrorObject(supabaseError))
        return
      }

      console.log(supabaseData)
      res.status(200).json(supabaseData)
      return
    }else{
      res.status(401).json(createErrorObject('Unauthorized to fetch collections')) //Forbidden. Unauthed users can't fetch collections
      return
    }
  } catch (error) {
    res.status(500).json(createErrorObject(error))
    return
  }

})

app.post('/api/v1/collections', authChecker, async (req, res) => {
  const collectionName = req.body.collectionName
  if(!collectionName){
    res.status(400).json(createErrorObject('Invalid name for a collection'))
    return
  }

  if(collectionName){
    try {
      if(!res.locals?.authenticated){
        res.status(500).json(createErrorObject('Couldn\'t create a collection. Try again later!'))
        return
      }
      if(res.locals.authenticated){
        const { data: supabaseData, error: supabaseError } = await supabase
                                .from('Collections')
                                .insert({ name: collectionName, 'user_id': res.locals.decoded.sub})
                                .select()
          
        if(supabaseError){
          res.status(500).json(createErrorObject(supabaseError))
          return
        }

        res.status(200).json(supabaseData)
        return

      }else{
        res.status(401).json(createErrorObject('Unauthorized to create a collection'))
        return
      }
    } catch (error) {
      res.status(500).json(createErrorObject(error)) // Internal server error (500)
      return
    }
  }else{
    res.status(400).json(createErrorObject('Invalid name for a collection'))//Bad Request. Can't create undefined collectionNames
  }
})

app.listen(process.env.SERVER_PORT, () => {
    console.log("App listening")
}) 