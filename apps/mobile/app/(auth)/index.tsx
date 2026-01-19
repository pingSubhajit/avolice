import * as AuthSession from 'expo-auth-session'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import {Text} from 'react-native'
import {Screen} from '../../components/ui/Screen'
import {setRefreshToken} from '../../lib/auth'
import {env} from '../../lib/env'

export default function AuthScreen() {
	WebBrowser.maybeCompleteAuthSession()

	async function signIn(provider: 'google' | 'microsoft') {
		const redirectURI = AuthSession.makeRedirectUri({
			scheme: 'avolice',
			path: 'auth/callback'
		})

		const startRes = await fetch(
			`${env.webBaseUrl}/api/auth/oauth/${provider}/start`,
			{
				method: 'POST',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify({redirectURI})
			}
		)

		if (!startRes.ok) {
			throw new Error(`Start failed (${startRes.status})`)
		}
		const {authorizeUrl} = (await startRes.json()) as {authorizeUrl: string}

		const result = await WebBrowser.openAuthSessionAsync(
			authorizeUrl,
			redirectURI
		)
		if (result.type !== 'success') {
			return
		}

		const parsed = Linking.parse(result.url)
		const code = parsed.queryParams?.code as string | undefined
		const state = parsed.queryParams?.state as string | undefined
		if (!code || !state) {
			throw new Error('Missing code/state')
		}

		const cbRes = await fetch(
			`${env.webBaseUrl}/api/auth/oauth/${provider}/callback`,
			{
				method: 'POST',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify({code, state})
			}
		)

		if (!cbRes.ok) {
			throw new Error(`Callback failed (${cbRes.status})`)
		}
		const data = (await cbRes.json()) as {refreshToken: string}
		await setRefreshToken(data.refreshToken)
	}

	return (
		<Screen className="flex-1 justify-center gap-3 bg-black px-6">
			<Text className="text-3xl text-white">Avolice</Text>
			<Text className="text-sm text-white/60">Sign in to continue.</Text>

			<Text
				className="mt-6 rounded-xl bg-white px-4 py-3 text-center font-medium text-black"
				onPress={() => signIn('google')}
			>
				Continue with Google
			</Text>
			<Text
				className="rounded-xl bg-white px-4 py-3 text-center font-medium text-black"
				onPress={() => signIn('microsoft')}
			>
				Continue with Microsoft
			</Text>
		</Screen>
	)
}
