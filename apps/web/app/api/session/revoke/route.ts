import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'

export const runtime = 'nodejs'

type RevokeBody = {refreshToken?: string}

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as RevokeBody
	const refreshToken = body.refreshToken
	if (!refreshToken) {
		return NextResponse.json(
			{error: 'refreshToken_required'},
			{status: 400}
		)
	}

	const ctx = await auth.$context
	await ctx.internalAdapter.deleteSession(refreshToken)
	return NextResponse.json({ok: true})
}
