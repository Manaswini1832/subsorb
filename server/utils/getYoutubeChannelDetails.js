import OpenAI from "openai";
import axios from 'axios'
import dotenv from 'dotenv';
dotenv.config();

//call youtube api for youtube channel results
//call openai api for summary + tags

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

    const openAIClient = new OpenAI({
        apiKey: process.env.SERVER_OPENAI_API_KEY_PROD,
    });

    const channelDescription =
            ytData.items?.[0]?.snippet?.description || "";

    const openAIResponse = await openAIClient.responses.create({
        model: "gpt-5.5",
        input: `
        Return ONLY valid JSON in this exact format:

        {
        "summary": "2-3 line summary",
        "tags": ["tag1", "tag2", "tag3"]
        }

        Channel description:
        ${channelDescription}

        Channel handle:
        ${channelHandle}
        `,
    });

    const aiData = JSON.parse(openAIResponse.output_text);

    //create embedding for this youtube channel based on ai generated tags
    let channelEmbedding = null;

    try {
        const tags =
        Array.isArray(aiData.tags)
            ? aiData.tags
            : [];

        //richer contxt
        const embeddingText = `
        ${aiData.summary ?? ""}

        ${tags.join(" ")}

        ${channelDescription}

        ${channelHandle}
        `;

        const embeddingResponse =
        await openAIClient.embeddings.create({
            input: embeddingText,
            model: "text-embedding-3-small",
        });

        channelEmbedding =
        embeddingResponse.data[0].embedding;

    } catch (err) {
        console.log(
        "Embedding generation failed:",
        err.message
        );
    }

    return {
        status : 200,
        message : 'Successfully fetched youtube channel details',
        data : ytData,
        aiData: aiData.summary,
        aiTags: aiData.tags,
        channelEmbedding: channelEmbedding
    }
}