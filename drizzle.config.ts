import {config} from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({path: ".env"})


export default defineConfig({
  out: './migrations',
  schema: './lib/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url:(process.env.DATABASE_URL!),
  },
});