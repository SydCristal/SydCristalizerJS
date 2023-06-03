import { l } from './Localization'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import styled from 'styled-components'
import { SectionHeading } from '../UI'

const Main = styled.main`
  flex: 2;
`

export default function Palette() {
		const { modScheme } = useModSchemeContext()
		const { language } = useLanguageContext()
		if (!modScheme?.key) return <main />

		l.setLanguage(language)

		return (
				<Main>
						<SectionHeading>{l.editor}</SectionHeading>
				</Main>
		)
}