import {Link} from 'expo-router'
import {Text} from 'react-native'
import {Screen} from '../../components/ui/Screen'

export default function AuthScreen() {
	return (
		<Screen className="flex-1 items-center justify-center bg-black">
			<Text className="text-3xl text-white">Avolice</Text>
			<Text className="mt-2 text-sm text-white/60">
				Sign in (placeholder)
			</Text>
			<Link className="mt-6 text-white underline" href="/today">
				Continue
			</Link>
		</Screen>
	)
}
