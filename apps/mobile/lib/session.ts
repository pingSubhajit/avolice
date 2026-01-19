import {refreshSession} from './api'
import {getRefreshToken} from './auth'

export type SessionState = {
	accessToken: string
	user: {id: string; email: string; name: string; image?: string | null}
}

export async function bootstrapSession(): Promise<SessionState | null> {
	const rt = await getRefreshToken()
	if (!rt) {
		return null
	}
	const data = await refreshSession()
	return {accessToken: data.accessToken, user: data.user}
}
