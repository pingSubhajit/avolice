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
		// Better Auth native flow:
		// - Browser hits /api/auth/mobile/start/:provider (server sets OAuth cookies and redirects to Google/Microsoft)
		// - Provider returns to /api/auth/callback/:provider (Better Auth)
		// - Better Auth redirects to /api/auth/mobile/finish (same browser, cookies present)
		// - /finish redirects to avolice://auth/callback?refreshToken=...
		const appReturnUrl = AuthSession.makeRedirectUri({
			scheme: 'avolice',
			path: 'auth/callback'
		})

		const startUrl = `${env.webBaseUrl}/api/auth/mobile/start/${provider}`
		const result = await WebBrowser.openAuthSessionAsync(
			startUrl,
			appReturnUrl
		)
		if (result.type !== 'success') {
			return
		}

		const parsed = Linking.parse(result.url)
		const refreshToken = parsed.queryParams?.refreshToken as
			| string
			| undefined
		if (!refreshToken) {
			throw new Error(
				`Missing refreshToken in callback URL: ${result.url}`
			)
		}
		await setRefreshToken(refreshToken)
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
