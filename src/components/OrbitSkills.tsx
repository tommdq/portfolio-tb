const OrbitSkills = () => {
	return (
		<ul className='grid h-[40rem] w-[40rem] place-items-center'>
			<li className='sun peer group rotate-[-360deg] hover:rotate-0'>
				<img src='../../assets/code.svg' alt='code' className='h-10 w-10' />
			</li>

			<li className='orbit-ring h-[39rem] w-[39rem] peer-hover:animate-none'>
				<img src='' alt='' />
				<img src='' alt='' />
				<img src='' alt='' />
				<img src='' alt='' />
			</li>

			<li className='orbit-ring h-[31rem] w-[31rem] peer-hover:animate-spin'>
				<img src='' alt='' />
				<img src='' alt='' />
				<img src='' alt='' />
				<img src='' alt='' />
			</li>

			<li className='orbit-ring h-[23rem] w-[23rem] '>
				<img
					src='../../assets/skills/react.svg'
					alt='typescript'
					className='orbit-icon -top-4 right-1/2 '
				/>
				<img
					src='../../assets/skills/git.svg'
					alt='git'
					className='orbit-icon -bottom-4 right-1/2 rounded-full'
				/>
				<img src='' alt='' />
				<img src='' alt='' />
			</li>

			<li className='orbit-ring h-[15rem] w-[15rem] '>
				<img
					src='../../assets/skills/html5.svg'
					alt='html5'
					className='orbit-icon top-16 -left-2 '
				/>
				<img
					src='../../assets/skills/css.svg'
					alt='css'
					className='orbit-icon bottom-0 left-8'
				/>
				<img
					src='../../assets/skills/js.svg'
					alt='js'
					className='orbit-icon top-12 right-0'
				/>
				<img
					src='../../assets/skills/typescript.svg'
					alt='typescript'
					className='orbit-icon bottom-4 right-6'
				/>
				<img
					src='../../assets/skills/node.svg'
					alt='node'
					className='orbit-icon -top-4 left-24'
				/>
			</li>
		</ul>
	)
}

export default OrbitSkills
