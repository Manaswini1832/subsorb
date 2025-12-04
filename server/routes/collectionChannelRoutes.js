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
            res.status(500).json(createErrorObject('Can\'t fetch channels in a collection right now. Try again later!'))
            return
        }

        if(res.locals.authenticated){
            const token = req.header('Authorization')?.split(' ')[1]

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
                res.status(500).json(createErrorObject(supabaseError))//TODO : Brainstorm an informative error here
                return
            }

            res.status(200).json(supabaseData)
            return

        }else{
            res.status(401).json(createErrorObject('Unauthorized to fetch channels from this collection'))
            return
        }
    } catch (error) {
        res.status(500).json(createErrorObject(error)) // Internal server error (500)
        return
    }
})

//get json by collection name
router.get('/:collecName', authChecker, async (req, res) => {
    try {
        if(!res.locals?.authenticated){
            res.status(500).json(createErrorObject('Can\'t fetch channels in the collection right now. Try again later!'))
            return
        }

        if(res.locals.authenticated){
            const token = req.header('Authorization')?.split(' ')[1];

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
            const queryCollection = req.params.collecName

            if(!queryCollection){
                res.status(400).json(createErrorObject('Can\'t fetch channels from an invalid collection'))
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
                res.status(500).json(createErrorObject(supabaseError))//TODO : Brainstorm an informative error here
                return
            }

            res.status(200).json(supabaseData)
            return

        }else{
            res.status(401).json(createErrorObject('Unauthorized to fetch channels from this collection'))
            return
        }
    } catch (error) {
        res.status(500).json(createErrorObject(error)) // Internal server error (500)
        return
    }
})
  
router.post('/', authChecker, async (req, res) => {
    const collectionName = req.body.collecName
    const channelHandle = req.body.channelHandle

    if(!collectionName || !channelHandle){
        res.status(400).json(createErrorObject('Can\'t create a collection-channel with null records'))
        return
    }

    if(!res.locals?.authenticated){
        res.status(500).json(createErrorObject('Couldn\'t add channel to collection. Try again later!'))
        return
    }

    if(res.locals.authenticated){
        const token = req.header('Authorization')?.split(' ')[1];

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
        )


        let supabaseCollecs, supabaseCollecsError
        let supabaseChans, supabaseChansError

        try {
            const result = await supabase2
                .from('Collections')
                .select()
                .eq('name', collectionName)
            supabaseCollecs = result.data
            supabaseCollecsError = result.error
        } catch (error) {
            return res.status(500).json(createErrorObject("Error fetching collection"))
        }

        try {
            const result = await supabase2
                .from('Channels')
                .select()
                .eq('handle', channelHandle);
            supabaseChans = result.data;
            supabaseChansError = result.error;
        } catch (error) {
            return res.status(500).json(createErrorObject("Error fetching channel"))
        }

        if (supabaseCollecsError || supabaseChansError) {
            return res.status(500).json(createErrorObject("Error occurred in fetching collections or channels"));
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
                .eq('Collections.name', collectionName)
            if (supabaseError) {
                return res.status(500).json(createErrorObject(supabaseError))
            }
            return res.status(200).json(supabaseData);
        } catch (error) {
            return res.status(500).json(createErrorObject("Error inserting into collection_channels"))
        }

    }else{
        res.status(401).json(createErrorObject('Unauthorized to add channels to this collection'))
        return
    }
})
  

export default router