import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { config } from 'dotenv'
import * as schema from './schema'

config({ path: '.env' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

export { db }