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
				star: 'linear-gradient(90deg, #fff, transparent)'
			},
			width: {
				navIcon: '2.5rem'
			},
			height: {
				navIcon: '2.5rem'
			},
			boxShadow: {
				star: '0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 0 8px rgba(255,255,255,0.1), 0 0 0 20px rgba(255,255,255,1)'
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
				},
				animateBg: {
					'0%,100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.2)' }
				},
				animateStar: {
					'0%': { transform: 'rotate(315deg) translateX(0)' },
					'70%': { opacity: 1},
					'100%': { transform: 'rotate(315deg) translateX(-1000px)', opacity: 0 }
				}
			},
			animation: {
				compass: 'wiggle 2s linear',
				stars: 'animateStar 2s linear infinite'
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
				2750: '2750ms',
			},
			screens: {
				md: '860px'
			}
		}
	},
	plugins: [
		require('tailwindcss-animation-delay'),
		require('tailwindcss-animation')
	]
}
