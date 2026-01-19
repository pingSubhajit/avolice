import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'
import {signAccessToken} from '@/lib/tokens'

export const runtime = 'nodejs'

type RefreshBody = {refreshToken?: string}

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as RefreshBody
	const refreshToken = body.refreshToken
	if (!refreshToken) {
		return NextResponse.json(
			{error: 'refreshToken_required'},
			{status: 400}
		)
	}

	const ctx = await auth.$context
	const existing = await ctx.internalAdapter.findSession(refreshToken)
	if (!existing) {
		return NextResponse.json({error: 'invalid_refreshToken'}, {status: 401})
	}

	// Rotate: create a new session token and revoke the old one
	const newSession = await ctx.internalAdapter.createSession(
		existing.user.id,
		false
	)
	await ctx.internalAdapter.deleteSession(refreshToken)

	const newRefreshToken = newSession.token
	const accessToken = await signAccessToken({
		sub: existing.user.id,
		sid: newRefreshToken
	})

	return NextResponse.json({
		accessToken,
		refreshToken: newRefreshToken,
		user: {
			id: existing.user.id,
			email: existing.user.email,
			name: existing.user.name,
			image: existing.user.image
		}
	})
}
