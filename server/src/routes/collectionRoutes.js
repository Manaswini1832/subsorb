import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from '../utils/getSupabaseClient.js'
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import { databaseResponseTimeHistogram } from '../utils/metrics.js';
dotenv.config();

const router = express.Router();

router.get('/', authChecker, async (req, res) => {
  /*
    |--------------------------------------------------------------------------
    | Metrics
    |--------------------------------------------------------------------------
    */
    const metricsLabels = {
      operation : 'getCollections'
    }

    const timer = databaseResponseTimeHistogram.startTimer();

    /*
    |--------------------------------------------------------------------------
    | Actual logic
    |--------------------------------------------------------------------------
    */
  try {
    if(!res?.locals?.authenticated){
      logger.error('Unauthorized user tried to access collections. Authentication required');
      timer({...metricsLabels, success: false});
      res
        .status(401)
        .json(createErrorObject('Unauthorized: authentication required.'))
      return;
    }

    const token = req?.header('Authorization')?.split(' ')[1];
    if(!token){
      logger.error('Unauthorized user tried to access collections. Missing or invalid authorization token');
      timer({...metricsLabels, success: false});
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
     timer({...metricsLabels, success: false}); 
     res
        .status(500)
        .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
      return;
    }

    logger.info('User : ' + res?.locals?.decoded?.payload?.sub + ' collections fetched successfully')
    timer({...metricsLabels, success: true});
    return res
            .status(200)
            .json(supabaseData);

    }catch (error) {
      logger.error('Server error while fetching collections : ' + error.message)
      timer({...metricsLabels, success: false});
    return res
            .status(500)
            .json(createErrorObject('SERVER ERROR : ' + error.message));
  }
  
});
  
router.post('/', authChecker, async (req, res) => {
  /*
    |--------------------------------------------------------------------------
    | Metrics
    |--------------------------------------------------------------------------
    */
    const metricsLabels = {
      operation : 'makeCollection'
    }

    const timer = databaseResponseTimeHistogram.startTimer();

    /*
    |--------------------------------------------------------------------------
    | Actual logic
    |--------------------------------------------------------------------------
    */

  try {
    if(!res?.locals?.authenticated){
      logger.error('Unauthorized user tried to add collections. Authentication required');
      timer({...metricsLabels, success: false});
      res
        .status(401)
        .json(createErrorObject('Unauthorized: authentication required.'))
      return;
    }

      const token = req?.header('Authorization')?.split(' ')[1];
      if(!token){
        logger.error('Unauthorized user tried to add collections. Missing or invalid authorization token');
        timer({...metricsLabels, success: false});
        return res
        .status(400)
        .json(createErrorObject('Missing or invalid authorization token.'));
      }

      const supabase2 = getSupabaseClient(token);
      const userId = res?.locals?.decoded?.payload?.sub;
      if (!userId) {
        logger.error('Unauthorized user tried to add collection')
        timer({...metricsLabels, success: false});
        return res.status(401).json(
          createErrorObject('Unauthenticated user.')
        );
      }

      const collectionName = req?.body?.collectionName;
      if (!collectionName || collectionName.length > 50) {
        logger.error('User : ' + userId + ' tried to create invalid collection')
        timer({...metricsLabels, success: false});
        return res
          .status(400)
          .json(createErrorObject('Invalid collection name'));
      }

      logger.info('User : ' + userId + ' is adding a collection with name = ' + collectionName);

      const { data: supabaseData, error: supabaseError } = await supabase2
                                                            .from('Collections')
                                                            .insert({ name: collectionName, user_id: userId })
                                                            .select();
        
      if(supabaseError){
        logger.error('User : ' + userId + ' failed to add collection. Error : ' + supabaseError.message);
        timer({...metricsLabels, success: false});
        res
          .status(500)
          .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
        return;
      }

      logger.info('User : ' + userId + ' successfully added collection');
      timer({...metricsLabels, success: true});
      return res
              .status(201)
              .json(supabaseData);

  } catch (error) {
      logger.error('Server error while adding collections : ' + error.message)
      timer({...metricsLabels, success: false});
      return res
          .status(500)
          .json(createErrorObject('SERVER ERROR : ' + error.message));
  }
});

export default router;