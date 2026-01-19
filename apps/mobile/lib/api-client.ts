import {refreshSession} from './api'
import {env} from './env'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
	accessToken = token
}

export function getAccessToken() {
	return accessToken
}

async function ensureAccessToken(): Promise<string> {
	if (accessToken) {
		return accessToken
	}
	const refreshed = await refreshSession()
	accessToken = refreshed.accessToken
	return accessToken
}

export async function authedFetch(
	path: string,
	init?: RequestInit
): Promise<Response> {
	const base = env.webBaseUrl.replace(/\/$/, '')

	const run = async () => {
		const token = await ensureAccessToken()
		const headers = new Headers(init?.headers)
		headers.set('authorization', `Bearer ${token}`)
		return await fetch(
			`${base}${path.startsWith('/') ? path : `/${path}`}`,
			{
				...init,
				headers
			}
		)
	}

	const res = await run()
	if (res.status !== 401) {
		return res
	}

	// Retry once after refresh (refresh rotates refresh token as well).
	const refreshed = await refreshSession()
	accessToken = refreshed.accessToken
	return await run()
}
