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
    if(res.locals == null || res.locals.authenticated == null || res.locals.authenticated == undefined){
      const message = createErrorObject("Couldn't create channels. Try again later!")
      
      res.send(500).json(message)
    }
    if(res.locals.authenticated == true){
      const channelHandle = req.body.channelHandle
      if(channelHandle == null){
        const message = createErrorObject('Invalid channel handle')
        res.json(message)
        res.sendStatus(400)
      }
      const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=%40${channelHandle}&key=${process.env.SERVER_YOUTUBE_API_KEY}`
      const { data, error } = await axios.get(url)

      if(error){
        const message = createErrorObject(error)
        res.json(message)
        res.sendStatus(500)
      }
      
      const channelDetails = JSON.stringify(data)
      
      [ data, error ] = await supabase
                                .from('Channels')
                                .insert({ handle: channelHandle, details: channelDetails})
          
      if(error == undefined){
        console.log('inside error')
        const message = createErrorObject(error)
        res.json(message)
        res.sendStatus(500)
      }
      console.log('after data')
      res.status(200).json(data)
    }else{
      const message = createErrorObject("Unauthorized to create channels")
      res.status(401).json(message)
    }
  } catch (error) {
    const message = createErrorObject(error)
    res.status(500).json(message) // Internal server error (500)
  }
})

//COLLECTIONS
app.get('/api/v1/collections', authChecker, async (req, res) => {
  try {
    if(res.locals == null || res.locals.authenticated == null || res.locals.authenticated == undefined){
      const message = createErrorObject("Couldn't fetch collections. Try again later!")
      res.send(500).json(message)
    }
    if(res.locals.authenticated == true){
      const { data, error } = await supabase
                              .from('Collections')
                              .select('name')
                              .eq('user_id', res.locals.decoded.sub)
        
      if(error){
        const message = createErrorObject(error)
        res.json(message)
        res.sendStatus(500)
      }
      res.status(200).json(data)
    }else{
      const message = createErrorObject("Unauthorized to fetch collections")
      res.status(401).json(message) //Forbidden. Unauthed users can't fetch collections
    }
  } catch (error) {
    const message = createErrorObject(error)
    res.status(500).json(message) // Internal server error (500)
  }

})

app.post('/api/v1/collections', authChecker, async (req, res) => {
  const collectionName = req.body.collectionName
  if(collectionName == null){
    const message = createErrorObject("Invalid name for a collection")
    res.status(400).json(message);//Bad request. Can send null collectionNames
  }

  if(collectionName !== undefined){
    try {
      if(res.locals == null || res.locals.authenticated == null || res.locals.authenticated == undefined){
        const message = createErrorObject("Couldn't create a collection. Try again later!")
        res.send(500).json(message)
      }
      if(res.locals.authenticated == true){
        const { data, error } = await supabase
                                .from('Collections')
                                .insert({ name: collectionName, 'user_id': res.locals.decoded.sub})
                                .select()
          
        if(error){
          const message = createErrorObject(error)
          res.json(message) //couldn't create collection
          res.sendStatus(500)
        }
        res.status(200).json(data)
      }else{
        const message = createErrorObject("Unauthorized to create a collection")
        res.status(401).json(message) //Forbidden. Unauthed users can't create collections
      }
    } catch (error) {
      const message = createErrorObject(error)
      res.status(500).json(message) // Internal server error (500)
    }
  }else{
    const message = createErrorObject("Invalid name for a collection")
    res.status(400).json(message)//Bad Request. Can't create undefined collectionNames
  }
})

app.listen(process.env.SERVER_PORT, () => {
    console.log("App listening")
}) 