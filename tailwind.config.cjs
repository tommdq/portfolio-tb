/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,astro}'],
	theme: {
		fontFamily: {
			sans: ['Kalam', 'sans-serif'],
			varela: ['Varela Round'],
			overpass: ['Overpass']
		},
		extend: {
			colors: {
				darkBlue: '#1D3354',
				softBlue: '#467599',
				softGreen: '#e6e2f1',
				hoverGreen: '#9ED8DB'
			}
		}
	},
	plugins: []
}
