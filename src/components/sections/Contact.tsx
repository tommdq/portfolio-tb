import { useState } from 'react'
import { RoughNotation } from 'react-rough-notation'

export const Contact = () => {
	const [show, setShow] = useState(false)
	return (
		<section id='contact' className='center h-screen'>
			<RoughNotation
				type='box'
				strokeWidth={5}
				customElement='div'
				show={show}
				color='#34a958'
				padding={20}
				animationDuration={2000}
				order={1}
			>
			<h1
				className='glowText relative cursor-pointer'
				data-text='Contact'
				onMouseEnter={() => setShow(true)}
				onMouseLeave={() => setShow(false)}
			>
					Contact
			</h1>
				</RoughNotation>
		</section>
	)
}
