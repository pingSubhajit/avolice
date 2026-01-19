import {drizzle} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	throw new Error('DATABASE_URL is required')
}

export const sql = postgres(databaseUrl, {
	max: 1,
	prepare: false
})

export const db = drizzle(sql, {schema})
export {schema}
