import {getRefreshToken, setRefreshToken} from './auth'
import {env} from './env'

type RefreshResponse = {
	accessToken: string
	refreshToken: string
	user: {id: string; email: string; name: string; image?: string | null}
}

export async function refreshSession(): Promise<RefreshResponse> {
	const refreshToken = await getRefreshToken()
	if (!refreshToken) {
		throw new Error('No refresh token')
	}

	const res = await fetch(`${env.webBaseUrl}/api/session/refresh`, {
		method: 'POST',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({refreshToken})
	})

	if (!res.ok) {
		throw new Error(`Refresh failed (${res.status})`)
	}
	const data = (await res.json()) as RefreshResponse
	await setRefreshToken(data.refreshToken)
	return data
}
