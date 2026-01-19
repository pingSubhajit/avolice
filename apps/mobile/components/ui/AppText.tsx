import type {TextProps} from 'react-native'
import {Text} from 'react-native'

type AppTextProps = TextProps & {
	className?: string
}

export function AppText({className, ...props}: AppTextProps) {
	const merged = ['font-sans text-foreground', className]
		.filter(Boolean)
		.join(' ')
	return <Text className={merged} {...props} />
}

export function MonoText({className, ...props}: AppTextProps) {
	const merged = ['font-mono text-foreground', className]
		.filter(Boolean)
		.join(' ')
	return <Text className={merged} {...props} />
}
