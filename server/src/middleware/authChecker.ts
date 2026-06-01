import dotenv from "dotenv";
dotenv.config();
import createErrorObject from "../utils/error.js";
import type { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";
import logger from "../utils/logger.js";

let JWKS_URL = "";

if (process.env.SERVER_SUPABASE_ENVIRONMENT === "PROD") {
  JWKS_URL = `${process.env.SERVER_SUPABASE_PROJECT_URL_PROD}/auth/v1/.well-known/jwks.json`;
} else {
  JWKS_URL = `${process.env.SERVER_SUPABASE_PROJECT_URL_DEV}/auth/v1/.well-known/jwks.json`;
}

const PROJECT_JWKS = createRemoteJWKSet(new URL(JWKS_URL));

type VerifiedJWT = {
  payload: JWTPayload;
  protectedHeader: Record<string, unknown>;
};

async function verifyProjectJWT(jwt: string): Promise<VerifiedJWT> {
  return jwtVerify(jwt, PROJECT_JWKS);
}

const authChecker = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  logger.debug("Authentication middleware");
  const token = req?.header("Authorization")?.split(" ")[1]; //aceess tok

  if (!token) {
    logger.error("No token, auth denied!");
    res.status(401).json(createErrorObject("No token, auth denied!"));
    return;
  }

  try {
    const decoded = await verifyProjectJWT(token);

    res.locals.authenticated = true;
    res.locals.decoded = decoded;

    logger.debug(
      `Successfully authenticated user with id: ${decoded.payload.sub}`,
    );

    logger.debug(res.locals);

    next();
  } catch (err: unknown) {
    logger.error({ err }, "JWT verification failed:");

    res.status(401).json(createErrorObject("Invalid token, auth denied!"));
  }
};

export default authChecker;
