import { About } from './About'
import { Contact } from './Contact'
import { Projects } from './Projects'
import { Skills } from './Skills'

export default function Sections() {

	return (
		<div id='sectionWrapper'>
			<About />
			<Skills />
			<Projects />
			<Contact />
		</div>
	)
}
