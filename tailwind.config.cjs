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
				navBlue: '#21395b',
				softBlue: '#467599',
				softGreen: '#e6e2f1',
			},
			width: {
				navIcon: '2.5rem'
			},
			height: {
				navIcon: '2.5rem'
			},
			keyframes: {
				wiggle: {
					'0%': { transform: 'rotate(0deg)' },
					'30%': { transform: 'rotate(1080deg)' },
					'50%': { transform: 'rotate(1080deg)' },
					'55%': { transform: 'rotate(1092deg)' },
					'60%': { transform: 'rotate(1072deg)' },
					'65%': { transform: 'rotate(1094deg)' },
					'70%': { transform: 'rotate(1076deg)' },
					'72%': { transform: 'rotate(1080deg)' },
					'80%': { transform: 'rotate(1080deg)' },
					'85%': { transform: 'rotate(1092deg)' },
					'90%': { transform: 'rotate(1072deg)' },
					'95%': { transform: 'rotate(1094deg)' },
					'100%': { transform: 'rotate(1076deg)' }
				}
			},
			animation: {
				compass: 'wiggle 2s linear',
			},
			screens: {
				md: '860px'
			}
		}
	},
	plugins: []
}
