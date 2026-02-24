import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import { createClient } from '@supabase/supabase-js'
import getYoutubeChannelDetails from '../utils/getYoutubeChannelDetails.js'
import isStale from '../utils/isStale.js'
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router()

router.get('/', authChecker, async (req, res) => {
    try {
        if(!res.locals?.authenticated){
          return res
            .status(401)
            .json(createErrorObject('Unauthorized: authentication required.'));
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

        //if both collection and channel-id are present, 
        const { data: supabaseData, error: supabaseError } = await supabase2
                                .from('Collection_Channels')
                                .select(`
                                            id,
                                            Collections:collection_id(name) ,
                                            Channels:channel_id(details)
                                        `)

        if(supabaseError){
            res
              .status(500)
              .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
            return;
        }

        return res
                .status(200)
                .json(supabaseData);

    } catch (error) {
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
});

//get json by collection name
router.get('/:collecName', authChecker, async (req, res) => {
    try {

        if(!res.locals?.authenticated){
          return res
            .status(401)
            .json(createErrorObject('Unauthorized: authentication required.'));
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

        //if both collection and channel-id are present
        const queryCollection = req.params.collecName;

        if(!queryCollection){
            res
                .status(400)
                .json(createErrorObject('Can\'t fetch channels from an invalid collection'));
            return
        }

        const { data: supabaseData, error: supabaseError } = await supabase2
                                .from('Collection_Channels')
                                .select(`
                                            id,
                                            Collections:collection_id(name) ,
                                            Channels:channel_id(details)
                                        `)
                                .eq('Collections.name', queryCollection)

        if(supabaseError){
            res
              .status(500)
              .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
            return;
          }
    
        return res
                  .status(200)
                  .json(supabaseData);

    } catch (error) {
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
});
  

let supabaseChans, supabaseChansError;
router.post('/', authChecker, async (req, res) => {
    const collectionName = req.body.collecName;
    const channelHandle = req.body.channelHandle;

    if(!collectionName || !channelHandle){
        res
            .status(400)
            .json(createErrorObject('Can\'t create a collection-channel with null records'));
        return
    }

    if(!res.locals?.authenticated){
        return res
        .status(401)
        .json(createErrorObject('Unauthorized: authentication required.'));
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

    //Get collection 
    let supabaseCollecs, supabaseCollecsError;
    try {
        const result = await supabase2
            .from('Collections')
            .select()
            .eq('name', collectionName)
        supabaseCollecs = result.data
        supabaseCollecsError = result.error
    } catch (error) {
        return res
                .status(500)
                .json(createErrorObject('SERVER ERROR(fetching collections) : ' + error.message));
    }

    //Get channel
    try {
        const { data, error }  = await supabase2
            .from('Channels')
            .select()
            .eq('handle', channelHandle);
        
        supabaseChans = data;
        supabaseChansError = error;

        //here if the data is stale(was first created 6months ago, update it)
        if(supabaseChans && isStale(supabaseChans.updated_at)){
            //get the data again and update supabase row
            const ytData = await getYoutubeChannelDetails(channelHandle);
            if(!ytData.data){
                throw err;           
            }
            const freshChannelDetails = JSON.stringify(ytData.data);
            //console.log("CHANDEETS REGET : ", freshChannelDetails);

            const { data, error }  = await supabase2
            .from('Channels')
            .update({
                details: freshChannelDetails,
                updated_at: new Date().toISOString(),
            })
            .eq('handle', channelHandle)
            .select();

            supabaseChans = data;
            supabaseChansError = error;
            // console.log("FRESHESSST DATA : ", supabaseChans)
        }
        
    } catch (error) {
        return res
                .status(500)
                .json(createErrorObject('SERVER ERROR(fetching channels) : ' + error.message));
    }

    if (supabaseCollecsError || supabaseChansError) {
        return res
                .status(500)
                .json(createErrorObject('Error occurred in fetching collections or channels'));
    }

    try {
        const collectionID = supabaseCollecs[0].id;
        const channelID = supabaseChans[0].id;
        const { data: supabaseData, error: supabaseError } = await supabase2
            .from('Collection_Channels')
            .insert({ collection_id: collectionID, channel_id: channelID })
            .select(`
                id,
                Collections:collection_id(name) ,
                Channels:channel_id(details)
            `)
            .eq('Collections.name', collectionName);


        if(supabaseError){
            if(supabaseError.message == 'duplicate key value violates unique constraint "unique_channels_in_collection_for_a_user"'){
                    return res
                           .status(409)
                           .json({message: "This channel already exists in the collection"});

            }
            console.log("Error in insertion(database error)");
            return res
              .status(500)
              .json(createErrorObject('DATABASE ERROR : ' + supabaseError.message));
        }

        return res
                .status(201)
                .json(supabaseData);

    } catch (error) {
        if(supabaseChans.length === 0){ //channel isn't in db
            return res
                   .status(200)
                   .json({success: false, needsRetry: true});
        }
        
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
});
  

export default router;