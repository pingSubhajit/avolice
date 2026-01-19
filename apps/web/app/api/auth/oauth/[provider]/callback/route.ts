import {NextResponse} from 'next/server'

import {auth} from '@/lib/auth'
import {signAccessToken} from '@/lib/tokens'

export const runtime = 'nodejs'

type CallbackBody = {
	code?: string
	state?: string
}

export async function POST(
	request: Request,
	{params}: {params: Promise<{provider: string}>}
) {
	const {provider: providerId} = await params
	if (providerId !== 'google' && providerId !== 'microsoft') {
		return NextResponse.json({error: 'unsupported_provider'}, {status: 400})
	}

	const body = (await request.json().catch(() => ({}))) as CallbackBody
	if (!body.code || !body.state) {
		return NextResponse.json(
			{error: 'code_and_state_required'},
			{status: 400}
		)
	}

	const ctx = await auth.$context
	const provider = ctx.socialProviders.find((p) => p.id === providerId)
	if (!provider) {
		return NextResponse.json(
			{error: 'provider_not_configured'},
			{status: 500}
		)
	}

	const verification = await ctx.internalAdapter.findVerificationValue(
		body.state
	)
	if (!verification) {
		return NextResponse.json(
			{error: 'invalid_or_expired_state'},
			{status: 400}
		)
	}

	let stateData: {
		providerId: string
		codeVerifier: string
		redirectURI: string
	} | null = null
	try {
		stateData = JSON.parse(verification.value)
	} catch {
		stateData = null
	}

	if (
		!stateData ||
		stateData.providerId !== providerId ||
		typeof stateData.codeVerifier !== 'string' ||
		typeof stateData.redirectURI !== 'string'
	) {
		return NextResponse.json(
			{error: 'invalid_state_payload'},
			{status: 400}
		)
	}

	await ctx.internalAdapter.deleteVerificationValue(verification.id)

	const tokens = await provider.validateAuthorizationCode({
		code: body.code,
		codeVerifier: stateData.codeVerifier,
		redirectURI: stateData.redirectURI
	})

	const userInfo = await provider.getUserInfo(tokens)
	if (!userInfo?.user?.email) {
		return NextResponse.json(
			{error: 'provider_userinfo_failed'},
			{status: 401}
		)
	}

	const accountId = String(userInfo.user.id)
	const email = userInfo.user.email

	const existing = await ctx.internalAdapter.findOAuthUser(
		email,
		accountId,
		providerId
	)
	let userId: string

	if (existing) {
		userId = existing.user.id
		const account = await ctx.internalAdapter.findAccountByProviderId(
			accountId,
			providerId
		)
		if (account) {
			await ctx.internalAdapter.updateAccount(account.id, {
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				idToken: tokens.idToken,
				accessTokenExpiresAt: tokens.accessTokenExpiresAt,
				refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
				scope: tokens.scopes?.join(' ')
			})
		}
	} else {
		const created = await ctx.internalAdapter.createOAuthUser(
			{
				name: userInfo.user.name || '',
				email,
				image: userInfo.user.image,
				emailVerified: userInfo.user.emailVerified || false
			},
			{
				providerId,
				accountId,
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				idToken: tokens.idToken,
				accessTokenExpiresAt: tokens.accessTokenExpiresAt,
				refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
				scope: tokens.scopes?.join(' ')
			}
		)
		userId = created.user.id
	}

	const refreshSession = await ctx.internalAdapter.createSession(
		userId,
		false
	)
	const refreshToken = refreshSession.token
	const accessToken = await signAccessToken({sub: userId, sid: refreshToken})

	return NextResponse.json({
		accessToken,
		refreshToken,
		user: {
			id: userId,
			email,
			name: userInfo.user.name || '',
			image: userInfo.user.image
		}
	})
}
