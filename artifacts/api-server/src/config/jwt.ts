import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('[FATAL SECURITY ERROR]: JWT_SECRET environment variable is required.');
}

export const JWT_SECRET = jwtSecret;
