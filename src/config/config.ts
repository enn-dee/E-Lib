import { config as conf } from "dotenv";

conf();

const _config = {
   port: process.env.PORT,
   database_url: process.env.DB_URL,
   env: process.env.NODE_ENV,
   jwtSecret: process.env.JWT_Secret,
   cloud_name: process.env.cloud_name,
   api_key: process.env.api_key,
   api_secret: process.env.api_secret,
};

export const config = Object.freeze(_config);
