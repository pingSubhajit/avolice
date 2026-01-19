// This file is intentionally committed so `pnpm typecheck` passes in CI/dev
// even before Uniwind generates its own typings (which happens when Metro runs).
//
// Once you start Metro, Uniwind may overwrite/regenerate this file.

import 'react-native'

declare module 'react-native' {
	interface ViewProps {
		className?: string
	}

	interface TextProps {
		className?: string
	}
}
