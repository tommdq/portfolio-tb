/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: ['./src/**/*.{html,js,astro}'],
	theme: {
		fontFamily: {
			sans: ['Kalam', 'sans-serif'],
			varela: ['Varela Round'],
			overpass: ['Overpass']
		},
		extend: {
			colors: {
				softBlue: '#005C7E',
				darkBlue: '#063254',
				softGreen: '#e6e2f1',
				navBar: '#002A39',
				exNavBar: '#467599'
			},
			width: {
				navIcon: '2.5rem'
			},
			height: {
				navIcon: '2.5rem'
			},
			boxShadow: {},
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
				},
				wobble: {
					'0%': { transform: 'scale3d(1, 1, 1)' },
					'30%': { transform: 'scale3d(1.25, 0.75, 1)' },
					'40%': { transform: 'scale3d(0.75, 1.25, 1)' },
					'50%': { transform: 'scale3d(1.15, 0.85, 1)' },
					'65%': { transform: 'scale3d(0.95, 1.05, 1)' },
					'75%': { transform: 'scale3d(1.05, 0.95, 1)' },
					'100%': { transform: 'transform: scale3d(1, 1, 1)' }
				}
			},
			animation: {
				compass: 'wiggle 2s linear',
				wobble: 'wobble 0.9s both'
			},
			animationDuration: {
				1250: '1250ms',
				1500: '1500ms',
				1750: '1750ms',
				2500: '2500ms',
				2000: '2000ms',
				2250: '2250ms',
				3000: '3000ms'
			},
			animationDelay: {
				2750: '2750ms'
			},
			screens: {
				md: '950px',
				lg: '1150px'
			}
		}
	},
	plugins: [require('tailwindcss-animation-delay'), require('tailwindcss-animation')]
}
