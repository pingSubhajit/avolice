import type {PropsWithChildren} from 'react'
import type {ViewProps} from 'react-native'
import {View} from 'react-native'

type ScreenProps = PropsWithChildren<
	ViewProps & {
		className?: string
	}
>

export function Screen({children, className, ...props}: ScreenProps) {
	return (
		<View className={className} {...props}>
			{children}
		</View>
	)
}
