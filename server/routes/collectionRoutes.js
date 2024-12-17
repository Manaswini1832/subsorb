import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router()

router.get('/', authChecker, async (req, res) => {
    try {
      if(!res.locals?.authenticated){
        res.status(500).json(createErrorObject('Couldn\'t fetch collections. Try again later!'))
        return
      }
  
      if(res.locals.authenticated == true){
        //TODO : handle token errors or null token stuff
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
                                .from('Collections')
                                .select('name')
                                //.eq('user_id', res.locals.decoded.sub)
                                
        if(supabaseError){
          res.status(500).json(createErrorObject(supabaseError))
          return
        }
  
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
  
  router.post('/', authChecker, async (req, res) => {
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
  

  export default router