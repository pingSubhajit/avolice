import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {bearer} from 'better-auth/plugins/bearer'
import {multiSession} from 'better-auth/plugins/multi-session'

import {db, schema} from '@/db'

const baseURL = process.env.BETTER_AUTH_URL
const secret = process.env.BETTER_AUTH_SECRET

if (!baseURL) {
	throw new Error('BETTER_AUTH_URL is required')
}
if (!secret || secret.length < 32) {
	throw new Error(
		'BETTER_AUTH_SECRET is required and must be at least 32 characters'
	)
}

export const auth = betterAuth({
	baseURL,
	secret,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
		},
		microsoft: {
			clientId: process.env.MICROSOFT_CLIENT_ID as string,
			clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
			tenantId: process.env.MICROSOFT_TENANT_ID
		}
	},
	// For mobile: we use Bearer access tokens for our own APIs, but Better Auth's
	// bearer plugin remains useful for future usage of Better Auth endpoints.
	plugins: [bearer(), multiSession()],
	session: {
		// Refresh token (Better Auth session token) lifetime. We rotate it in our own `/api/session/refresh`.
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 // 24 hours
	}
})
