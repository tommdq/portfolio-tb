/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: ['./src/**/*.{html,js,astro,tsx}'],
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
				navBar: '#111827',
				primaryGreen: '#34a958',
				orbit: '#1d7dca'
			},
			width: {
				navIcon: '2.5rem'
			},
			height: {
				navIcon: '2.5rem'
			},
			boxShadow: {
				sun: '0 0 120px #f1da36, 0 0 60px #f2ad00, 0 0 10px #c96800, 0 0 200px #feff8f',
				projectCard: '3px 3px 20px rgba(80, 78, 78, 0.5)'
			},
			backgroundImage: {
				stars: "url('https://www.transparenttextures.com/patterns/stardust.png')"
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
				wobble: {
					'0%': { transform: 'scale3d(1, 1, 1)' },
					'30%': { transform: 'scale3d(1.25, 0.75, 1)' },
					'40%': { transform: 'scale3d(0.75, 1.25, 1)' },
					'50%': { transform: 'scale3d(1.15, 0.85, 1)' },
					'65%': { transform: 'scale3d(0.95, 1.05, 1)' },
					'75%': { transform: 'scale3d(1.05, 0.95, 1)' },
					'100%': { transform: 'transform: scale3d(1, 1, 1)' }
				},
				stars: {
					'0%': { 'background-position': '0 0' },
					'100%': { 'background-position': '798px 798px' }
				},
				glow: {
					'0%': { 'box-shadow': '-35px 0 60px 0 #fff' },
					'25%': { 'box-shadow': '-35px 0 65px 0 #fff' },
					'50%': { 'box-shadow': '-35px 0 70px 0 #fff' },
					'75%': { 'box-shadow': '-35px 0 75px 0 #fff' },
					'100%': { 'box-shadow': '-35px 0 80px 0 #fff' }
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				spinRight: {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				spinLeft: {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(-360deg)' }
				},
				expandAndShrink: {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.2)' },
					'100%': { transform: 'scale(1)' }
				}
			},
			animation: {
				compass: 'wiggle 2s linear',
				wobble: 'wobble 0.9s both',
				stars: 'stars 30s linear infinite',
				blink: 'glow 4s infinite alternate',
				fadeIn: 'fadeIn ease 2s',
				orbitSpinRight: 'spinRight 15s linear infinite',
				orbitSpinLeft: 'spinLeft 15s linear infinite',
				rotate: 'spinRight 5s linear',
				expandAndShrink: 'expandAndShrink 8s ease-in-out infinite'
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
