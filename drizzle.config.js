/** @type { import("drizzle-kit").Config } */

import dotenv from 'dotenv';  // Import dotenv
dotenv.config();  // Load environment variables

export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
    }
  };