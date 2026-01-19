import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import {Pressable, View} from 'react-native'
import {AppText, MonoText} from '../../components/ui/AppText'
import {Screen} from '../../components/ui/Screen'
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
		// The final redirect is `avolice://auth/callback?...` which Expo Router handles via `app/auth/callback.tsx`.
	}

	return (
		<Screen className="flex-1 bg-background px-6">
			<View className="flex-1 justify-center">
				<MonoText className="text-xs text-muted-foreground">
					AVOLICE / v0
				</MonoText>
				<AppText className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
					Avolice
				</AppText>
				<AppText className="mt-2 text-sm text-muted-foreground">
					Sign in to orchestrate your day.
				</AppText>

				<View className="mt-8 gap-3">
					<Pressable
						className="rounded-2xl bg-primary px-4 py-4"
						onPress={() => signIn('google')}
					>
						<AppText className="text-center font-medium text-primary-foreground">
							Continue with Google
						</AppText>
					</Pressable>

					<Pressable
						className="rounded-2xl border border-border bg-card px-4 py-4"
						onPress={() => signIn('microsoft')}
					>
						<AppText className="text-center font-medium text-card-foreground">
							Continue with Microsoft
						</AppText>
					</Pressable>

					<AppText className="mt-2 text-center text-xs text-muted-foreground">
						OAuth-only • Multi-device sessions
					</AppText>
				</View>
			</View>
		</Screen>
	)
}
