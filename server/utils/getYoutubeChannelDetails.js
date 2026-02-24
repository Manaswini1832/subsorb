import axios from 'axios'
import dotenv from 'dotenv';
dotenv.config();

export default async function getYoutubeChannelDetails(channelHandle){
    const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=%40${channelHandle}&key=${process.env.SERVER_YOUTUBE_API_KEY}`
    const { data: ytData, error: ytError } = await axios.get(url);

    if (ytError) {
        return {
            status : 500,
            message : ytError.message,
            data : null
        }
    }

    if(ytData.pageInfo.totalResults == 0){
        return {
            status : 400,
            message : 'Invalid channel handle',
            data : null
        }
    }

    return {
        status : 200,
        message : 'Successfully fetched youtube channel details',
        data : ytData
    }
}