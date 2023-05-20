import { l } from './Localization'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from 'react-headless-accordion'
import { Bg } from '../../Utils'
import styled, { css } from 'styled-components'
import { SectionHeading, Button } from '../UI'
import _ from 'lodash'
import { useState } from 'react'
import { ReactSortable } from 'react-sortablejs'

const HeaderWrapper = styled.div`
  ${styles => ({ ...styles })};
  padding-right: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  * {
    margin: 0;
    color: ${({ color }) => color};
    line-height: ${({ lineHeight }) => lineHeight};
  };
`

const Title = styled.div`
  flex: 1;
`

const iconStyles = css`;
  border: none;
  width: 20px;
  height: 20px;
  margin-right: 5px;
`

const Expander = styled(AccordionHeader)`
  ${styles => ({ ...styles, ...iconStyles })};
		transition: transform 0.3s ease-in-out;
  cursor: pointer;
`

const DragHandle = styled.div`
  ${({ background }) => ({ background, ...iconStyles })};
  cursor: none;
  opacity: 0;
		transition: opacity 0.2s ease-in-out;
  &:hover {
    opacity: 1;
  };
`

const Content = styled(AccordionBody)`
  margin: -3px 0;
  padding: 3px 0;
`

export default function Navigation() {
		const { modScheme, setModScheme } = useModSchemeContext()
		const { language } = useLanguageContext()
		const { selection, setSelection } = useSelectionContext()
		const [displayNames, setDisplayNames] = useState(JSON.parse(localStorage.getItem('displayNames')) || false)
		if (!modScheme?.key) return <aside />

		l.setLanguage(language)

		const BuildAccordionItem = (el, path = [], displayed) => {
				const { key, type, items, modules } = el
				const depth = path.length
				const onClick = e => setSelection(path)
				const selectionStr = selection?.map(({ el: { key } }) => key).join('.')
				const namespace = path.map(({ el: { key } }) => key).join('.') || ''
				const expanded = selectionStr?.startsWith(namespace)
				const selected = selectionStr === namespace
				const expandable = modules?.length || items?.length

				const buildAccordionHeader = expanded => {
						const height = `${depth === 0 ? 35 : ((type !== 'item' || selected) ? 30 : 24)}px`

						const wrapperStyles = {
								fontSize: `${(type === 'item' || depth > 3) ? 16 : (22 - depth * 2)}px`,
								fontWeight: type === 'item' ? 'normal' : 'bold',
								height,
								lineHeight: height,
								paddingLeft: `${depth * 15 + (expandable ? 10 : 35)}px`,
								color: selected ? 'wheat' : 'inherit',
								background: ((depth === 0 || displayed) && selected) ? `${Bg('MenuItem_selected')} center center / cover no-repeat` : 'transparent',
								margin: (type === 'item' && selected) ? '-3px 0 -3px' : ''
						}

						const expanderStyles = {
								background: `${Bg('NavigationExpander' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
								transform: `rotate(${expanded ? -180 : 0}deg)`
						}

						const dragHandleStyles = {
								background: `${Bg('DragHandle' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
						}

						const displayedName = displayNames ? el.localization?.Title[language] || key : key

						return (
								<HeaderWrapper {...wrapperStyles}>
										{expandable && <Expander {...expanderStyles} />}
										<Title onClick={onClick}>
												{type === 'item' ? <span>{displayedName}</span> : <h3>{displayedName}</h3>}
										</Title>
										{Boolean(depth) &&
												<DragHandle {...dragHandleStyles} />}
								</HeaderWrapper>
						)
				}

				return (
						<AccordionItem
								key={key}
								isActive={expanded}>
								{({ open }) => (<>
										{buildAccordionHeader(open)}
										{type !== 'item' &&
												<Content>
														{['modules', 'items'].map(group => {
																return el[group]?.map((subEl, index) => {
																		return BuildAccordionItem({ ...subEl }, [...path, { group, index, el: subEl }], open)
																})
														})}
												</Content>}
								</>)}
						</AccordionItem>
				)
		}

		const switchStyles = {
				minWidth: '300px',
				minHeight: '30px',
				fontSize: '14px',
				margin: '0 auto',
				display: 'block'
		}

		const onDisplayModeSwitchClick = () => {
				setDisplayNames(!displayNames)
				localStorage.setItem('displayNames', !displayNames)
		}

		return (
				<Accordion as='aside'>
						<SectionHeading>{l.navigation}</SectionHeading>
						<Button btn='LongSwitch' onClick={onDisplayModeSwitchClick} styles={switchStyles}>
								{displayNames ? l.displayKeys : l.displayNames}
						</Button>
						{BuildAccordionItem(modScheme)}
				</Accordion>
		)
}