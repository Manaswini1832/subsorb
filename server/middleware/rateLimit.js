import { rateLimit } from 'express-rate-limit';

//ratelimiter allows to add channels to db if they're not already existing in supabase restrictedly
//limit is 5channels can be added per minute
export const rateLimiter = rateLimit({
    windowMs: 60 * 1000, //60sec limit
    limit: 5
})