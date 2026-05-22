import { rateLimit } from 'express-rate-limit';

export const youTubeRateLimiter = rateLimit({
    windowMs: 60 * 1000, //60sec limit
    limit: 5
});

//for embeddings
export const openAIRateLimiter = rateLimit({
    windowMs: 60 * 1000, //60sec limit
    limit: 2
})