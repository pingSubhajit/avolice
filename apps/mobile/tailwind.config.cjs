const base = require('@avolice/tailwind-config')

/** @type {import('tailwindcss').Config} */
module.exports = {
	...base,
	content: [
		'./app/**/*.{js,jsx,ts,tsx}',
		'./components/**/*.{js,jsx,ts,tsx}',
		'./lib/**/*.{js,jsx,ts,tsx}'
	]
}
