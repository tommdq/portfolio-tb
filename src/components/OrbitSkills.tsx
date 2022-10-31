import { ICONS } from '../constants/icons'

const OrbitSkills = () => {
	return (
		<ul className='grid h-[40rem] w-[40rem] place-items-center'>
			<li className='sun peer group rotate-[-360deg] hover:rotate-0'>
				<img src={ICONS.HTML_TAG} alt='code' className='h-10 w-10' />
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
				<img src={ICONS.JIRA} alt='jira' className='orbit-icon -top-4 right-1/2 ' />
				<img
					src={ICONS.GIT}
					alt='git'
					className='orbit-icon -bottom-4 right-1/2 rounded-full'
				/>
				<img src={ICONS.VIM} alt='vim' className='orbit-icon -right-4 top-1/2 ' />
				<img src={ICONS.REACT} alt='react' className='orbit-icon -left-4 top-1/2' />
				<img
					src={ICONS.VERCEL}
					alt='vercel'
					className='orbit-icon left-6 top-12 rounded-full bg-slate-300'
				/>
				<img
					src={ICONS.NPM}
					alt='npm'
					className='orbit-icon left-6 bottom-12 rounded-full bg-slate-300'
				/>
				<img
					src={ICONS.TAILWIND}
					alt='tailwind'
					className='orbit-icon right-6 bottom-12'
				/>
				<img
					src={ICONS.TESTING_LIBRARY}
					alt='testing library'
					className='orbit-icon roundedfull right-6 top-12'
				/>
			</li>

			<li className='orbit-ring h-[15rem] w-[15rem] '>
				<img src={ICONS.HTML} alt='html5' className='orbit-icon top-16 -left-2 ' />
				<img src={ICONS.CSS} alt='css' className='orbit-icon bottom-0 left-8' />
				<img src={ICONS.JS} alt='js' className='orbit-icon top-12 right-0' />
				<img
					src={ICONS.TYPESCRIPT}
					alt='typescript'
					className='orbit-icon bottom-4 right-6'
				/>
				<img src={ICONS.NODE} alt='node' className='orbit-icon -top-4 left-24' />
			</li>
		</ul>
	)
}

export default OrbitSkills
