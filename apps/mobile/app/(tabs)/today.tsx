import {routineSchema} from '@avolice/shared'
import {View} from 'react-native'
import {AppText, MonoText} from '../../components/ui/AppText'
import {Screen} from '../../components/ui/Screen'

const exampleRoutine = routineSchema.safeParse({
	id: 'routine-example',
	title: 'Morning Protocol',
	steps: [
		{
			id: 'step-1',
			title: 'Hydrate',
			type: 'action'
		}
	]
})

export default function TodayScreen() {
	return (
		<Screen className="flex-1 bg-background px-6">
			<View className="flex-1 justify-center">
				<MonoText className="text-xs text-muted-foreground">
					TODAY
				</MonoText>
				<AppText className="mt-2 text-2xl font-semibold text-foreground">
					Today plan
				</AppText>
				<AppText className="mt-2 text-sm text-muted-foreground">
					Timeline placeholder
				</AppText>

				<MonoText className="mt-6 text-xs text-muted-foreground">
					shared-schema: {exampleRoutine.success ? 'ok' : 'error'}
				</MonoText>
			</View>
		</Screen>
	)
}
