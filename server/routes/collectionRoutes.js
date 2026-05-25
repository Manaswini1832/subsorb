import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from '../utils/getSupabaseClient.js'
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/', authChecker, async (req, res) => {
  try {
    if(!res?.locals?.authenticated){
      logger.error('Unauthorized user tried to access collections. Authentication required');
      res
        .status(401)
        .json(createErrorObject('Unauthorized: authentication required.'))
      return;
    }

    const token = req?.header('Authorization')?.split(' ')[1];
    if(!token){
      logger.error('Unauthorized user tried to access collections. Missing or invalid authorization token');
      return res
      .status(400)
      .json(createErrorObject('Missing or invalid authorization token.'));
    }

    const supabase2 = getSupabaseClient(token);

    const { data: supabaseData, error: supabaseError } = await supabase2
                                                          .from('Collections')
                                                          .select()
                                                          .order('created_at', { ascending: false });
                            
    if(supabaseError){
     logger.error('Database error while fetching channels for user : ' + supabaseError.message)
      res
        .status(500)
        .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
      return;
    }

    logger.info('User : ' + res?.locals?.decoded?.payload?.sub + ' collections fetched successfully')

    return res
            .status(200)
            .json(supabaseData);

    }catch (error) {
      logger.error('Server error while fetching collections : ' + error.message)
    return res
            .status(500)
            .json(createErrorObject('SERVER ERROR : ' + error.message));
  }
  
});
  
router.post('/', authChecker, async (req, res) => {
  try {
    if(!res?.locals?.authenticated){
      logger.error('Unauthorized user tried to add collections. Authentication required');
      res
        .status(401)
        .json(createErrorObject('Unauthorized: authentication required.'))
      return;
    }

      const token = req?.header('Authorization')?.split(' ')[1];
      if(!token){
        logger.error('Unauthorized user tried to add collections. Missing or invalid authorization token');
        return res
        .status(400)
        .json(createErrorObject('Missing or invalid authorization token.'));
      }

      const supabase2 = getSupabaseClient(token);
      const userId = res?.locals?.decoded?.payload?.sub;
      if (!userId) {
        logger.error('Unauthorized user tried to add collection')
        return res.status(401).json(
          createErrorObject('Unauthenticated user.')
        );
      }

      const collectionName = req?.body?.collectionName;
      if (!collectionName) {
        logger.error('User : ' + userId + ' tried to add collection with an empty name')
        return res
          .status(400)
          .json(createErrorObject('Collection name is required.'));
      }

      logger.info('User : ' + userId + ' is adding a collection with name = ' + collectionName);

      const { data: supabaseData, error: supabaseError } = await supabase2
                                                            .from('Collections')
                                                            .insert({ name: collectionName, user_id: userId })
                                                            .select();
        
      if(supabaseError){
        logger.error('User : ' + userId + ' failed to add collection. Error : ' + supabaseError.message);
        res
          .status(500)
          .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
        return;
      }

      logger.info('User : ' + userId + ' successfully added collection');
      return res
              .status(201)
              .json(supabaseData);

  } catch (error) {
      logger.error('Server error while adding collections : ' + error.message)
      return res
          .status(500)
          .json(createErrorObject('SERVER ERROR : ' + error.message));
  }
});

export default router;