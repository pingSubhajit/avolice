import {View} from 'react-native'
import {AppText, MonoText} from '../../components/ui/AppText'
import {Screen} from '../../components/ui/Screen'

export default function BuilderScreen() {
	return (
		<Screen className="flex-1 bg-background px-6">
			<View className="flex-1 justify-center">
				<MonoText className="text-xs text-muted-foreground">
					BUILDER
				</MonoText>
				<AppText className="mt-2 text-2xl font-semibold text-foreground">
					Routine builder
				</AppText>
				<AppText className="mt-2 text-sm text-muted-foreground">
					Tree editor placeholder
				</AppText>
			</View>
		</Screen>
	)
}
