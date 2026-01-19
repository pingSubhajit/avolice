import {View} from 'react-native'
import {AppText, MonoText} from '../../components/ui/AppText'
import {Screen} from '../../components/ui/Screen'

export default function ChatScreen() {
	return (
		<Screen className="flex-1 bg-background px-6">
			<View className="flex-1 justify-center">
				<MonoText className="text-xs text-muted-foreground">
					CHAT
				</MonoText>
				<AppText className="mt-2 text-2xl font-semibold text-foreground">
					Chat
				</AppText>
				<AppText className="mt-2 text-sm text-muted-foreground">
					Text-first assistant placeholder
				</AppText>
			</View>
		</Screen>
	)
}
