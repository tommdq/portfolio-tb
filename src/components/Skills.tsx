import { useState } from 'react'
import OrbitSkills from './OrbitSkills'

export default function Skills() {
	const [showSkills, setShowSkills] = useState(true)

	return (
		<section id='skills' className='center relative h-screen'>
			<h3 className='text-center text-4xl'>My skills</h3>
			{showSkills ? (
				<OrbitSkills />
			) : (
				<h1
					className='glowText relative duration-500 hover:scale-110 cursor-pointer'
					data-text='Skills'
					onClick={() => setShowSkills(true)}
				>
					Skills
				</h1>
			)}
		</section>
	)
}
