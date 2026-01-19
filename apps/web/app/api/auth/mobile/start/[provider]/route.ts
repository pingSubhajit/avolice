import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(
	_request: Request,
	{params}: {params: Promise<{provider: string}>}
) {
	const {provider} = await params
	if (provider !== 'google' && provider !== 'microsoft') {
		return NextResponse.json({error: 'unsupported_provider'}, {status: 400})
	}

	// This endpoint MUST be opened in the browser so Better Auth can set its OAuth state cookies.
	// After successful OAuth, Better Auth will redirect to callbackURL (below).
	const webBaseUrl = process.env.BETTER_AUTH_URL
	if (!webBaseUrl) {
		return NextResponse.json(
			{error: 'missing_BETTER_AUTH_URL'},
			{status: 500}
		)
	}
	const callbackURL = `${webBaseUrl}/api/auth/mobile/finish`

	// Use Better Auth's own handler so all cookies/redirect logic stays consistent.
	const signInUrl = `${webBaseUrl}/api/auth/sign-in/social`
	const req = new Request(signInUrl, {
		method: 'POST',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({provider, callbackURL})
	})

	const res = await auth.handler(req)

	// Better Auth returns JSON plus a Location header when redirecting is enabled.
	// For mobile, we want a real browser redirect so the in-app browser navigates to Google/Microsoft.
	const location = res.headers.get('location')
	if (location) {
		return NextResponse.redirect(location, 302)
	}

	return res
}
