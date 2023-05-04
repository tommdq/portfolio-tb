import { useEffect, useRef } from 'react'
import { ICONS } from '../constants/icons'

const OrbitSkills = () => {
	const orbitRefs = [
		useRef<HTMLLIElement>(null),
		useRef<HTMLLIElement>(null),
		useRef<HTMLLIElement>(null),
		useRef<HTMLLIElement>(null),
		useRef<HTMLLIElement>(null),
	]

useEffect(() => {
	orbitRefs.forEach((orbitRef, index) => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.remove('h-0', 'w-0', 'transition-none')
				} else {
					entry.target.classList.add('h-0', 'w-0', 'transition-none')
				}
			})
		})
		if (orbitRef.current) {
			observer.observe(orbitRef.current)
		}
		return () => {
			observer.disconnect()
		}
	})
}, [])

	return (
		<ul className='grid h-[40rem] w-[40rem] place-items-center'>
			<li className='sun h-0 w-0' ref={orbitRefs[0]}>
				<img src={ICONS.HTML_TAG} alt='code' className='h-10 w-10' />
			</li>

			<li className='orbit-ring4 h-0 w-0 animate-rotate' ref={orbitRefs[1]}>
				<img src='' alt='' />
				<img src='' alt='' />
				<img src='' alt='' />
				<img src='' alt='' />
			</li>

			<li className='orbit-ring3 h-0 w-0' ref={orbitRefs[2]}>
				<img src={ICONS.NEXT_JS} alt='nextjs' className='orbit-icon rounded-full -bottom-4 right-[45%]'/>
				<img src={ICONS.JENKINS} alt='jenkins' className='orbit-icon -top-4 right-[45%]'/>
				<img src={ICONS.JEST} alt='jest' className='orbit-icon -right-4 top-1/2' />
				<img src={ICONS.VITE} alt='vite' className='orbit-icon -left-4 top-1/2' />
				<img src={ICONS.AWS} alt='aws' className='orbit-icon bg-slate-50 rounded-full left-14 top-12' />
				<img src={ICONS.REDHAT} alt='redhat' className='orbit-icon left-14 bottom-14' />
				<img src={ICONS.GRAPHQL} alt='graphql' className='orbit-icon right-14 bottom-14' />
				<img src={ICONS.POSTGRESQL} alt='postgresql' className='orbit-icon right-14 top-14' />
			</li>

			<li className='orbit-ring2 h-0 w-0' ref={orbitRefs[3]}>
				<img src={ICONS.JIRA} alt='jira' className='orbit-icon -top-4 right-[45%] ' />
				<img src={ICONS.GIT} alt='git' className='orbit-icon -bottom-4 right-[45%] rounded-full' />
				<img src={ICONS.VIM} alt='vim' className='orbit-icon -right-4 top-1/2 ' />
				<img src={ICONS.REACT} alt='react' className='orbit-icon -left-4 top-1/2 ' />
				<img src={ICONS.VERCEL} alt='vercel' className='orbit-icon left-6 top-12 rounded-full bg-slate-50' />
				<img src={ICONS.NPM} alt='npm' className='orbit-icon left-6 bottom-12 rounded-full bg-slate-50' />
				<img src={ICONS.TAILWIND} alt='tailwind' className='orbit-icon right-6 bottom-12 ' />
				<img src={ICONS.TESTING_LIBRARY} alt='testing-library' className='orbit-icon roundedfull right-6 top-12' />
			</li>

			<li className='orbit-ring1 h-0 w-0' ref={orbitRefs[4]}>
				<img src={ICONS.HTML} alt='html5' className='orbit-icon top-16 -left-2 ' />
				<img src={ICONS.CSS} alt='css' className='orbit-icon bottom-0 left-8' />
				<img src={ICONS.JS} alt='js' className='orbit-icon top-12 right-0 ' />
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
