import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'

export const runtime = 'nodejs'

type RevokeAllBody = {refreshToken?: string}

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as RevokeAllBody
	const refreshToken = body.refreshToken
	if (!refreshToken) {
		return NextResponse.json(
			{error: 'refreshToken_required'},
			{status: 400}
		)
	}

	const ctx = await auth.$context
	const session = await ctx.internalAdapter.findSession(refreshToken)
	if (!session) {
		return NextResponse.json({error: 'invalid_refreshToken'}, {status: 401})
	}

	await ctx.internalAdapter.deleteSessions(session.user.id)
	return NextResponse.json({ok: true})
}
