import { useState } from 'react'
import { RoughNotation } from 'react-rough-notation'
import { PROJECTS } from '../../constants'

export function Projects() {
	const [show, setShow] = useState(false)
	return (
		<section id='projects' className='center h-screen gap-20'>
			<div className='center'>
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
						data-text='Projects'
						onMouseEnter={() => setShow(true)}
						onMouseLeave={() => setShow(false)}
					>
						Projects
					</h1>
				</RoughNotation>
			</div>
			<div className='grid grid-cols-2 items-center gap-x-40 gap-y-12 p-12'>
				{PROJECTS.map(({ description, id, image, link, name, source, tags }) => (
					<div className='w-52 rounded-xl text-center shadow-projectCard sm:w-full'>
						{name}
						<img src={image} alt={image} />
						<div className='text-center z-20 w-full'>
							<h3 className='font-semibold tracking-[2px] py-2'>{name}</h3>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
