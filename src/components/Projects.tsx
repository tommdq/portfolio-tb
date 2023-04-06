import { useState } from 'react'
import { RoughNotation } from 'react-rough-notation'

const Projects = () => {
	const [show, setShow] = useState(false)
	return (
		<section id='projects' className='center h-screen'>
			<h1
				className='glowText relative cursor-pointer'
				data-text='Projects'
				onMouseEnter={() => setShow(true)}
				onMouseLeave={() => setShow(false)}
			>
				<RoughNotation
					type='box'
					strokeWidth={5}
					customElement='h1'
					show={show}
					color='#34a958'
					padding={20}
					animationDuration={2000}
					order={1}
				>
					Projects
				</RoughNotation>
			</h1>
		</section>
	)
}

export default Projects
