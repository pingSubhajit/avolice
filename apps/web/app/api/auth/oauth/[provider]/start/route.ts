import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'

export const runtime = 'nodejs'

function randomBase64Url(bytes: number) {
	const buf = crypto.getRandomValues(new Uint8Array(bytes))
	return Buffer.from(buf).toString('base64url')
}

export async function POST(
	request: Request,
	{params}: {params: Promise<{provider: string}>}
) {
	const {provider: providerId} = await params
	if (providerId !== 'google' && providerId !== 'microsoft') {
		return NextResponse.json({error: 'unsupported_provider'}, {status: 400})
	}

	const body = await request.json().catch(() => ({}))
	const redirectURI = body.redirectURI as string | undefined
	if (!redirectURI) {
		return NextResponse.json({error: 'redirectURI_required'}, {status: 400})
	}

	let ctx: Awaited<typeof auth.$context>
	try {
		ctx = await auth.$context
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e)
		return NextResponse.json(
			{error: 'auth_init_failed', message},
			{status: 500}
		)
	}
	const provider = ctx.socialProviders.find((p) => p.id === providerId)
	if (!provider) {
		return NextResponse.json(
			{error: 'provider_not_configured'},
			{status: 500}
		)
	}

	const state = randomBase64Url(24)
	const codeVerifier = randomBase64Url(96)
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

	try {
		await ctx.internalAdapter.createVerificationValue({
			identifier: state,
			value: JSON.stringify({providerId, codeVerifier, redirectURI}),
			expiresAt
		})
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e)
		return NextResponse.json(
			{error: 'oauth_state_persist_failed', message},
			{status: 500}
		)
	}

	const authorizeUrl = await provider.createAuthorizationURL({
		state,
		codeVerifier,
		redirectURI
	})

	return NextResponse.json({authorizeUrl: authorizeUrl.toString(), state})
}
