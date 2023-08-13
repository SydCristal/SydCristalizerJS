import { l } from './'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
//import { Bg } from '../../Utils'
//import styled from 'styled-components'
import { SectionHeading } from '../UI'

export default function Palette() {
		const { modScheme } = useModSchemeContext()
		const { language } = useLanguageContext()
		if (!modScheme?.key) return <main />

		l.setLanguage(language)

		return (
				<aside>
						<SectionHeading>{l.palette}</SectionHeading>
				</aside>
		)
}