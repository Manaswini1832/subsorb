import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from '../utils/getSupabaseClient.js'
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

        const supabase2 = getSupabaseClient(token);

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

          const supabase2 = getSupabaseClient(token);

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