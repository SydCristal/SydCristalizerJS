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

const HeaderWrapper = styled.div`
  ${({ targetedBg, color, lineHeight, ...styles }) => ({ ...styles })};
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
		&.targeted {
			background: ${({ targetedBg }) => targetedBg};
			background-color: rgba(82, 0, 137, 0.2);
			border-top: 2px solid #4b2f5b;
			border-bottom: 2px solid #4b2f5b;
		};
`

const Title = styled.span`
		display: block;
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

const DraggableMask = styled.div.attrs(({ id }) => ({ id }))`
		position: absolute;
		top: 0;
		z-index: -1;
		color: #584658;
		font-weight: bold;
		font-size: 22px;
`

export default function Navigation() {
		const { modScheme, setModScheme } = useModSchemeContext()
		const { language } = useLanguageContext()
		const { selection, setSelection } = useSelectionContext()
		const [displayNames, setDisplayNames] = useState(JSON.parse(localStorage.getItem('displayNames')) || false)
		const [draggedEl, setDraggedEl] = useState(null)
		if (!modScheme?.key) return <aside />

		l.setLanguage(language)

		const buildAccordionItem = (el, displayed, depth) => {
				const { key, type, items, modules, namespace, path } = el
				const onTitleClick = () => setSelection(el)
				const selected = selection?.namespace === namespace
				const expandable = !!(modules?.length || items?.length)
				const hasSelectedDescendant = expandable && !selected && selection?.namespace?.startsWith(namespace)

				const buildAccordionHeader = expanded => {
						const height = `${depth === 0 ? 35 : ((type !== 'item' || selected) ? 30 : 24)}px`
						const paddingLeft = depth * 15 + (type === 'item' ? 20 : (expandable ? 10 : 35))
						const styleAsSelected = !draggedEl && selected

						const wrapperStyles = {
								fontSize: `${(type === 'item' || depth > 3) ? 16 : (22 - depth * 2)}px`,
								fontWeight: type === 'item' ? 'normal' : 'bold',
								height,
								lineHeight: height,
								paddingLeft: `${paddingLeft}px`,
								color: styleAsSelected ? 'wheat' : 'inherit',
								background: ((depth === 0 || displayed) && styleAsSelected) ? `${Bg('NavigationItem_selected')} center center / cover no-repeat` : 'transparent',
								margin: (type === 'item' && selected) ? '-3px 0 -3px' : '',
								targetedBg: `${Bg('Navigation' + (depth === 0 ? 'Mod' : 'Item') + '_targeted')} center center / cover no-repeat`
						}

						const expanderStyles = {
								background: `${Bg('NavigationExpander' + (styleAsSelected ? '_selected' : ''))} center center / contain no-repeat`,
								transform: `rotate(${expanded ? -180 : 0}deg)`
						}

						const dragHandleStyles = {
								background: `${Bg('DragHandle' + (styleAsSelected ? '_selected' : ''))} center center / contain no-repeat`,
						}

						const displayedName = displayNames ? el.localization?.Title[language] || key : key
						const onExpanderClick = () => {
								if (expanded && hasSelectedDescendant) setSelection(el)
						}

						const childrenKeys = []

						if (items) childrenKeys.push(...items.map(({ key }) => key))
						if (modules) childrenKeys.push(...modules.map(({ key }) => key))

						const onDragStart = e => {
								setDraggedEl({ ...el })
								const mask = document.getElementById('draggable-mask')
								mask.innerHTML = displayedName
								e.dataTransfer.setDragImage(mask, 0, 0)
						}

						const onDragEnd = e => {
								setDraggedEl(null)
						}

						const onDrop = e => {
								e.target.closest('div')?.classList?.remove('targeted')
								const { namespace, ...updatedModScheme } = _.cloneDeep(modScheme)
								const groupName = `${draggedEl.type}s`
								const { path: draggedElPath, namespace: draggedElNamespace, ...draggedElData } = draggedEl
								const { path: _p, namespace: _n, ...elData } = el
								if (!el[groupName]) el[groupName] = []
								if (path?.length) {
										_.update(updatedModScheme, path, () => ({
												...elData,
												[groupName]: [...el[groupName], draggedElData]
										}))
								} else {
										if (!updatedModScheme[groupName]) updatedModScheme[groupName] = []
										updatedModScheme[groupName].push(draggedElData)
								}
								if (selection?.namespace.startsWith(draggedElNamespace)) setSelection(el)
								_.unset(updatedModScheme, draggedElPath)
								_.update(updatedModScheme, draggedElPath.slice(0, -1), children => children.filter(child => child))
								setDraggedEl(null)
								setModScheme(updatedModScheme)
						}

						const onDragOver = e => {
								if (type === 'item') return
								if (namespace.startsWith(draggedEl.namespace)) return
								if (childrenKeys.includes(draggedEl.key)) return

								e.target?.closest('div')?.classList?.add('targeted')
								e.preventDefault()
						}

						const onDragExit = ({ target }) => target.closest('div')?.classList?.remove('targeted')

						return (
								<HeaderWrapper
										onDrop={onDrop}
										onDragOver={onDragOver}
										onDragExit={onDragExit}
										{...wrapperStyles}>
										{expandable && <Expander onClick={onExpanderClick} {...expanderStyles} />}
										<Title onClick={onTitleClick}>
												{type === 'item' ? <span>{displayedName}</span> : <h3>{displayedName}</h3>}
										</Title>
										{Boolean(depth) &&
												<DragHandle {...dragHandleStyles}
														draggable={true}
														onDragStart={onDragStart}
														onDragEnd={onDragEnd} />}
								</HeaderWrapper>
						)
				}

				return (
						<AccordionItem
								key={key}
								isActive={hasSelectedDescendant}>
								{({ open }) => (<>
										{buildAccordionHeader(open)}
										{type !== 'item' &&
										<Content>
												{['modules', 'items'].map(group => {
														return el[group]?.map((subEl, index) => {
																return buildAccordionItem({ ...subEl, namespace: `${namespace}.${subEl.key}`, path: [ ...path, group, index ]}, displayed && open, depth + 1)
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
						{buildAccordionItem({ ...modScheme, namespace: modScheme.key, path: [] }, true, 0)}
						<DraggableMask id='draggable-mask'>{draggedEl?.key || ''}</DraggableMask>
				</Accordion>
		)
}