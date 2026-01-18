import type {Metadata} from 'next'
import {Instrument_Sans, JetBrains_Mono} from 'next/font/google'
import './globals.css'

const instrumentSans = Instrument_Sans({
	variable: '--font-instrument-sans',
	subsets: ['latin']
})

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: 'Avolice',
	description:
		'AI-first personal orchestration agent that turns routines into nested, rule-driven workflows ' +
		'and keeps them aligned with real calendar, so you always know the next action even when the day changes.'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${instrumentSans.variable} ${jetbrainsMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	)
}
