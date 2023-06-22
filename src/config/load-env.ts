import { config } from 'dotenv';

config();

export const CLIENT_URL = process.env.CLIENT_URL;
export const SERVER_PORT = process.env.PORT || 3001;
