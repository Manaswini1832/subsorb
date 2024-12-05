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

            //if both collection and channel-id are present, 
            const { data: supabaseData, error: supabaseError } = await supabase2
                                    .from('Collection_Channels')
                                    .select()

            if(supabaseError){
                console.log(supabaseError)
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
    const collectionName = req.body.collectionName
    const channelHandle = req.body.channelHandle

    if(!collectionName || !channelHandle){
        res.status(400).json(createErrorObject('Can\'t create a collection-channel with null records'))
        return
    }

    try {
        if(!res.locals?.authenticated){
            res.status(500).json(createErrorObject('Couldn\'t add channel to collection. Try again later!'))
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

            //get collection-id
            const { data: supabaseCollecs, error: supabaseCollecsError} = await supabase2
                                            .from('Collections')
                                            .select()
                                            .eq('name', collectionName)
            
            //get channel-id
            const { data: supabaseChans, error: supabaseChansError} = await supabase2
                                            .from('Channels')
                                            .select()
                                            .eq('handle', channelHandle)

            const collectionID = supabaseCollecs[0].id
            const channelID = supabaseChans[0].id

            if(supabaseChansError){
                res.status(500).json(createErrorObject('Can\'t add channel to collection. Try again later!'))
                return
            }

            if(!collectionID){
                res.status(404).json(createErrorObject('Collection doesn\'t exist'))
            }

            if(!channelID){
                res.status(404).json(createErrorObject('Channel doesn\'t exist'))
            }

            //if both collection and channel-id are present, 
            const { data: supabaseData, error: supabaseError } = await supabase2
                                    .from('Collection_Channels')
                                    .insert({ collection_id: collectionID, channel_id: channelID})
                                    .select()

            if(supabaseError){
                console.log(supabaseError)
                res.status(500).json(createErrorObject(supabaseError))//TODO : Brainstorm an informative error here
                return
            }

            res.status(200).json(supabaseData)
            return

        }else{
            res.status(401).json(createErrorObject('Unauthorized to add channels to this collection'))
            return
        }
    } catch (error) {
        res.status(500).json(createErrorObject(error)) // Internal server error (500)
        return
    }
})
  

export default router