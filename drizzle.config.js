import dotenv from 'dotenv';

dotenv.config(); // load .env for the drizzle-kit CLI

/** @type { import("drizzle-kit").Config } */
const config = {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};

export default config;