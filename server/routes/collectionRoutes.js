import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/', authChecker, async (req, res) => {
    try {
      if(!res.locals?.authenticated){
        res
          .status(401)
          .json(createErrorObject('Unauthorized: authentication required.'))
        return;
      }
  
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
                                .from('Collections')
                                .select('name');
                                
        if(supabaseError){
          res
            .status(500)
            .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
          return;
        }
  
        return res
                .status(200)
                .json(supabaseData);

      }catch (error) {
      return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
  
  });
  
  router.post('/', authChecker, async (req, res) => {
    const collectionName = req.body.collectionName;
    if (!collectionName) { //validate collection name
      return res
        .status(400)
        .json(createErrorObject('Collection name is required.'));
    }

      try {
        if(!res.locals?.authenticated){
          res
            .status(401)
            .json(createErrorObject('Unauthorized: authentication required.'))
          return;
        }

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
                                  .from('Collections')
                                  .insert({ name: collectionName, user_id: res.locals.decoded.payload.sub })
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