import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'
import {getBearerToken} from '@/lib/request'
import {verifyAccessToken} from '@/lib/tokens'

export const runtime = 'nodejs'

export async function GET() {
	const token = await getBearerToken()
	if (!token) {
		return NextResponse.json(
			{error: 'missing_authorization'},
			{status: 401}
		)
	}

	let payload: {sub: string; sid: string}
	try {
		payload = await verifyAccessToken(token)
	} catch {
		return NextResponse.json({error: 'invalid_access_token'}, {status: 401})
	}

	const ctx = await auth.$context
	const session = await ctx.internalAdapter.findSession(payload.sid)
	if (!session) {
		return NextResponse.json({error: 'invalid_session'}, {status: 401})
	}

	return NextResponse.json({
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			image: session.user.image
		}
	})
}
