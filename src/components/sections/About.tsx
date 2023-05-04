import { CoderIcon } from "../logos/CoderIcon";

export function About() {
	return (
		<section
			id='about'
			className='flex h-screen flex-col items-center justify-center gap-6 md:flex-row md:justify-between md:text-left'
		>
			<article className='flex flex-col gap-5 text-center md:text-start lg:min-w-fit'>
				<h1 className='text-white'>Hi! I'm Tomas</h1>
				<h2 className='text-softGreen'>
					Fullstack developer 💻
					<br /> Based in Mar del Plata, Argentina.
				</h2>
				<div className='text-lg font-light tracking-wide text-softGreen'>
					<p className='text-xl'>Cat lover 😺 and music enthusiast</p>
				</div>
			</article>
			<CoderIcon />
		</section>
	)
}
