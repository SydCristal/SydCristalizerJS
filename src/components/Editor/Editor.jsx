import { l, EditorControls } from './'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import styled from 'styled-components'
import { SectionHeading } from '../UI'

const Main = styled.main`
  flex: 1.5;
`
export default function Editor() {
		const { modScheme } = useModSchemeContext()
		const { language } = useLanguageContext()
		const { selection } = useSelectionContext()

		if (!modScheme?.key) return <main />

		l.setLanguage(language)

		//const selectedObj = cloneDeep(get(modScheme, selection))

		if (!selection) return (
				<Main>
						<SectionHeading>
								{l.editor}
						</SectionHeading>
				</Main>
		)

		return (
				<Main>
						<EditorControls />
				</Main>
		)
}