/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
	theme: {
		extend: {
			colors: {
				// Avolice (mobile-first) semantic tokens — Stone theme
				background: colors.stone[950],
				foreground: colors.stone[50],
				card: {
					DEFAULT: colors.stone[900],
					foreground: colors.stone[50]
				},
				muted: {
					DEFAULT: colors.stone[900],
					foreground: colors.stone[400]
				},
				border: colors.stone[800],
				ring: colors.stone[500],
				primary: {
					DEFAULT: colors.stone[50],
					foreground: colors.stone[950]
				},
				accent: {
					DEFAULT: colors.stone[800],
					foreground: colors.stone[50]
				}
			},
			fontFamily: {
				// Expo: these names must match the loaded font family names (see apps/mobile/app/_layout.tsx)
				sans: ['InstrumentSans_400Regular', 'System'],
				mono: ['JetBrainsMono_400Regular', 'System']
			}
		}
	},
	plugins: []
}
