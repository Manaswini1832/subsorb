import dotenv from 'dotenv';
dotenv.config();
import createErrorObject from '../utils/error.js'
import { jwtVerify, createRemoteJWKSet } from 'jose'


let JWKS_URL = '';

if (process.env.SERVER_SUPABASE_ENVIRONMENT === "PROD") {
    JWKS_URL = `${process.env.SERVER_SUPABASE_PROJECT_URL_PROD}/auth/v1/.well-known/jwks.json`;
} else {
    JWKS_URL = `${process.env.SERVER_SUPABASE_PROJECT_URL_DEV}/auth/v1/.well-known/jwks.json`;
}

const PROJECT_JWKS = createRemoteJWKSet(
  new URL(JWKS_URL)
)

async function verifyProjectJWT(jwt) {
  return jwtVerify(jwt, PROJECT_JWKS)
}

const authChecker = async (req, res, next) => {
    //console.log('AUTH MIDDLEWARE');
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        const message = createErrorObject('No token, auth denied!');
        return res.status(401).json(message);
    }

    try {
        const decoded = await verifyProjectJWT(token);
        res.locals.authenticated = true;
        res.locals.decoded = decoded;
        //console.log('Authed');
        next();
    } catch (err) {
        console.log('JWT verification failed:', err);
        const message = createErrorObject('Invalid token, auth denied!');
        return res.status(400).json(message);
    }
};

export default authChecker
