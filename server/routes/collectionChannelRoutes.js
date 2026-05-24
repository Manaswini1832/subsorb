import express from 'express'
import authChecker from '../middleware/authChecker.js'
import createErrorObject from '../utils/error.js'
import getSupabaseClient from '../utils/getSupabaseClient.js'
import getYoutubeChannelDetails from '../utils/getYoutubeChannelDetails.js'
import isStale from '../utils/isStale.js'
import PDFDocument from 'pdfkit'
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router()

//get json by collection name
router.get('/:collectionID', authChecker, async (req, res) => {
    try {

        if(!res?.locals?.authenticated){
          return res
            .status(401)
            .json(createErrorObject('Unauthorized: authentication required.'));
        }

        const token = req?.header('Authorization')?.split(' ')[1];
        if(!token){
            return res
            .status(400)
            .json(createErrorObject('Missing or invalid authorization token.'));
        }

        const supabase2 = getSupabaseClient(token);

        //if both collection and channel-id are present
        const queryCollection = req?.params?.collectionID;

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
                                                                    Collections:collection_id(
                                                                        name
                                                                    ),
                                                                    Channels:channel_id(
                                                                        ai_summary,
                                                                        ai_tags,
                                                                        details
                                                                    )
                                                                `)
                                                                .eq('Collections.id', queryCollection)
                                                                //no filter by user id due to RLS policy already configured on supabase

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
    if(!res?.locals?.authenticated){
        return res
        .status(401)
        .json(createErrorObject('Unauthorized: authentication required.'));
    }

    const collectionName = req?.body?.collecName;
    const channelHandle = req?.body?.channelHandle;
    const collectionID = req?.body?.collecID;

    console.log("POST : ", collectionName, collectionID, channelHandle)

    if(!collectionName || !channelHandle || !collectionID){
        res
            .status(400)
            .json(createErrorObject('Can\'t create a collection-channel with null records'));
        return
    }

    const token = req?.header('Authorization')?.split(' ')[1];
    if(!token){
        return res
        .status(400)
        .json(createErrorObject('Missing or invalid authorization token.'));
    }

    const supabase2 = getSupabaseClient(token);

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
        }
        
    } catch (error) {
        return res
                .status(500)
                .json(createErrorObject('SERVER ERROR(fetching channels) : ' + error.message));
    }

    if (supabaseChansError) {
        return res
                .status(500)
                .json(createErrorObject('Error occurred in fetching channels'));
    }

    try {
        const channelID = supabaseChans[0].id;
        const { data: supabaseData, error: supabaseError } = await supabase2
            .from('Collection_Channels')
            .insert({ collection_id: collectionID, channel_id: channelID })
            .select(`
                id,
                Collections:collection_id(
                    name
                ),
                Channels:channel_id(
                    ai_summary,
                    ai_tags,
                    details
                )
            `)
            .eq('Collections.id', collectionID);


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

router.post('/export-pdf', authChecker, async(req, res) => {
    try {
        if(!res?.locals?.authenticated){
            return res
                .status(401)
                .json(createErrorObject('Unauthorized: authentication required.'));
        }

        const token = req?.header('Authorization')?.split(' ')[1];
        if(!token){
            return res
            .status(400)
            .json(createErrorObject('Missing or invalid authorization token.'));
        }

        const decodedToken = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );

        const userName =
            decodedToken?.user_metadata?.full_name ||
            decodedToken?.user_metadata?.name ||
            'User';

        const collectionId = req?.body?.collectionID;
        const collectionName = req?.body?.collectionName;
        console.log(collectionId, collectionName)
        if(!collectionId || collectionId == '' || !collectionName || collectionName == ''){
            return res  
                    .status(400)
                    .json(createErrorObject('Can\'t create PDF for empty collection'))
        }

        const supabase2 = getSupabaseClient(token);
        const { data: channels, error: channelsError } = await supabase2
                                                        .from('Collection_Channels')
                                                        .select(`
                                                            id,
                                                            Collections:collection_id(
                                                                name
                                                            ),
                                                            Channels:channel_id(
                                                                ai_summary,
                                                                ai_tags,
                                                                details
                                                            )
                                                        `)
                                                        .eq('collection_id', collectionId)

        if (channelsError) {
            return res.status(500).json({
                message: "Failed to fetch channels",
            });
        }

        console.log("CHANNELS: ", channels)

        //new pdf doc
        const doc = new PDFDocument();

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${collectionName}.pdf"`
        );

        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // title
        doc.fontSize(24).text(`${userName}'s subsorb collection : ${collectionName}`);

        doc.moveDown();

        // channels
        channels.forEach((channel, index) => {

            const parsedDetails = JSON.parse(channel?.Channels?.details);

            const item = parsedDetails?.items?.[0];

            const title = item?.snippet?.title || 'Untitled Channel';

            const channelUrl = `https://www.youtube.com/channel/${item?.id}`;

            const youtubeDescription =
                item?.snippet?.description || '';

            const aiSummary =
                channel?.Channels?.ai_summary || '';

            const aiTags =
                channel?.Channels?.ai_tags?.join(', ') || '';

            doc
                .fontSize(18)
                .fillColor('black')
                .text(`${index + 1}. ${title}`);

            doc.moveDown(0.5);

            doc
                .fontSize(12)
                .fillColor('blue')
                .text(channelUrl, {
                    link: channelUrl,
                    underline: true,
                });

            doc.moveDown(0.5);

            // youtube description
            doc
                .text(`YouTube Description:`);

            doc
                .fontSize(11)
                .fillColor('black')
                .text(youtubeDescription);

            doc.moveDown(0.5);

            // ai summary
            doc
                .fontSize(12)
                .text(`AI generated Summary:`);

            doc
                .fontSize(11)
                .text(aiSummary);

            doc.moveDown(0.5);

            // ai tags
            doc
                .fontSize(12)
                .text(`AI generated Tags:`);

            doc
                .fontSize(11)
                .text(aiTags);

            doc.moveDown(2);
        });

        doc.moveDown(2);

        doc
        .fontSize(10)
        .fillColor("gray")
        .text("Powered by Subsorb", {
            link: "https://subsorb.in",
            underline: true,
            align: "center",
        });

        doc.end();


    } catch (error) {
        return res
              .status(500)
              .json(createErrorObject('SERVER ERROR : ' + error.message));
    }
})
  

export default router;