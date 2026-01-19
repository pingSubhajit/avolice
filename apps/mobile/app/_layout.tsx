import {useFonts} from 'expo-font'
import {Stack} from 'expo-router'
import '../global.css'

import {
	InstrumentSans_400Regular,
	InstrumentSans_500Medium,
	InstrumentSans_600SemiBold
} from '@expo-google-fonts/instrument-sans'
import {
	JetBrainsMono_400Regular,
	JetBrainsMono_600SemiBold
} from '@expo-google-fonts/jetbrains-mono'

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		InstrumentSans_400Regular,
		InstrumentSans_500Medium,
		InstrumentSans_600SemiBold,
		JetBrainsMono_400Regular,
		JetBrainsMono_600SemiBold
	})

	if (!fontsLoaded) {
		return null
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false
			}}
		/>
	)
}
