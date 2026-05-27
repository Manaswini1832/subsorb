import express from 'express'
import getSupabaseClient from '../utils/getSupabaseClient.js'
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/:collectionInfo', async (req, res) => {
  try {
    const supabase = getSupabaseClient(null);

    const slug = req?.params;
    const collectionID = slug?.collectionInfo?.split('-').pop();

    if(!collectionID){
      res
        .status(400)
        .json(createErrorObject('Can\'t fetch invalid collection'));
      return
    }

    const { data, error } = await supabase
      .from('Collections')
      .select('*')
      .eq('id', collectionID);

    if (error) {
      logger.error(error.message);

      return res.status(500).json({
        error: error.message
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});

export default router;