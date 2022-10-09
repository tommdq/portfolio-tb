/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,astro}'],
	theme: {
		fontFamily: {
			sans: ['Kalam', 'sans-serif'],
			nova: ['Nova Slim'],
			varela: ['Varela Round']
		},
		extend: {
			colors: {
				darkBlue: '#064789',
				softBlue: '#0077B6',
				softGreen: '#e6e2f1',
				// softGreen: '#80ffdb',
				hoverGreen: '#B9E28C'
			}
		}
	},
	plugins: []
}
