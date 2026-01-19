import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
	// Cookies are present here (set by Better Auth during /api/auth/callback/:provider).
	let session: Awaited<ReturnType<typeof auth.api.getSession>>
	try {
		session = await auth.api.getSession({
			headers: request.headers
		})
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e)
		return NextResponse.json(
			{error: 'get_session_failed', message},
			{status: 500}
		)
	}

	if (!session?.session?.token) {
		return NextResponse.json({error: 'no_session'}, {status: 401})
	}

	const refreshToken = session.session.token
	const deepLink = new URL('avolice://auth/callback')
	deepLink.searchParams.set('refreshToken', refreshToken)

	return NextResponse.redirect(deepLink.toString(), 302)
}
