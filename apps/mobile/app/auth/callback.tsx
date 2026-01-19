import {router, useLocalSearchParams} from 'expo-router'
import {useEffect, useState} from 'react'
import {View} from 'react-native'

import {AppText, MonoText} from '../../components/ui/AppText'
import {Screen} from '../../components/ui/Screen'
import {refreshSession} from '../../lib/api'
import {setAccessToken} from '../../lib/api-client'
import {setRefreshToken} from '../../lib/auth'

export default function AuthCallbackScreen() {
	const params = useLocalSearchParams()
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const run = async () => {
			const raw = params.refreshToken
			const refreshToken = Array.isArray(raw) ? raw[0] : raw

			if (!refreshToken || typeof refreshToken !== 'string') {
				setError('Missing refreshToken in callback URL')
				return
			}

			try {
				await setRefreshToken(refreshToken)
				// Immediately fetch an access token so API calls can start without waiting.
				const session = await refreshSession()
				setAccessToken(session.accessToken)

				router.replace('/(tabs)/today')
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e)
				setError(msg)
			}
		}

		void run()
	}, [params.refreshToken])

	return (
		<Screen className="flex-1 bg-background px-6">
			<View className="flex-1 justify-center">
				<MonoText className="text-xs text-muted-foreground">
					AUTH / CALLBACK
				</MonoText>
				<AppText className="mt-2 text-lg font-medium text-foreground">
					Signing you in…
				</AppText>
				{error ? (
					<AppText className="mt-2 text-sm text-red-400">
						{error}
					</AppText>
				) : (
					<AppText className="mt-2 text-sm text-muted-foreground">
						Finishing OAuth and creating your session.
					</AppText>
				)}
			</View>
		</Screen>
	)
}
