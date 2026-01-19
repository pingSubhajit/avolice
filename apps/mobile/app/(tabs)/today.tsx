import {routineSchema} from '@avolice/shared'
import {Text} from 'react-native'
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
		<Screen className="flex-1 items-center justify-center bg-black">
			<Text className="text-xl text-white">Today Plan</Text>
			<Text className="mt-2 text-sm text-white/60">
				Timeline placeholder
			</Text>
			<Text className="mt-4 text-xs text-white/40">
				Shared schema: {exampleRoutine.success ? 'ok' : 'error'}
			</Text>
		</Screen>
	)
}
