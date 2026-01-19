import {Text} from 'react-native'
import {Screen} from '../../components/ui/Screen'

export default function BuilderScreen() {
	return (
		<Screen className="flex-1 items-center justify-center bg-black">
			<Text className="text-xl text-white">Routine Builder</Text>
			<Text className="mt-2 text-sm text-white/60">
				Tree editor placeholder
			</Text>
		</Screen>
	)
}
