import {headers} from 'next/headers'

export async function getRequestHeader(name: string): Promise<string | null> {
	const h = await headers()
	return h.get(name)
}

export async function getBearerToken(): Promise<string | null> {
	const auth = await getRequestHeader('authorization')
	if (!auth) {
		return null
	}
	const m = auth.match(/^Bearer\s+(.+)$/i)
	return m?.[1] ?? null
}
