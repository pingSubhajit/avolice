import {jwtVerify, SignJWT} from 'jose'

export type AccessTokenPayload = {
	sub: string // userId
	sid: string // refresh/session token id (Better Auth session token)
}

type AccessTokenJwtPayload = {
	sub?: unknown
	sid?: unknown
}

function getJwtSecret(): Uint8Array {
	const secret = process.env.AVOLICE_JWT_SECRET
	if (!secret || secret.length < 32) {
		throw new Error(
			'AVOLICE_JWT_SECRET is required and must be at least 32 characters'
		)
	}
	return new TextEncoder().encode(secret)
}

function accessTtlSeconds(): number {
	const raw = process.env.AVOLICE_ACCESS_TOKEN_TTL_SECONDS
	if (!raw) {
		return 15 * 60
	}
	const n = Number(raw)
	if (!Number.isFinite(n) || n <= 0) {
		return 15 * 60
	}
	return Math.floor(n)
}

export async function signAccessToken(
	payload: AccessTokenPayload
): Promise<string> {
	const now = Math.floor(Date.now() / 1000)
	const exp = now + accessTtlSeconds()

	return await new SignJWT(payload)
		.setProtectedHeader({alg: 'HS256', typ: 'JWT'})
		.setIssuedAt(now)
		.setExpirationTime(exp)
		.sign(getJwtSecret())
}

export async function verifyAccessToken(
	token: string
): Promise<AccessTokenPayload> {
	const {payload} = await jwtVerify(token, getJwtSecret(), {
		algorithms: ['HS256']
	})
	const p = payload as AccessTokenJwtPayload
	if (typeof p.sub !== 'string' || typeof p.sid !== 'string') {
		throw new Error('Invalid token payload')
	}
	return {sub: p.sub, sid: p.sid}
}
