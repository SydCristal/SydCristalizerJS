import { l } from './Localization'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from 'react-headless-accordion'
import { Bg } from '../../Utils'
import styled, { css } from 'styled-components'
import { SectionHeading, Button } from '../UI'
import _ from 'lodash'
import { useState, useRef } from 'react'

const Aside = styled(Accordion)``

const HeaderWrapper = styled.div`
		${({ cloneBg, targetedBg, color, ...styles }) => ({ ...styles })};
		padding-right: 10px;
		display: flex;
		flex-direction: row;
		align-items: center;
		cursor: pointer;
		* {
				margin: 0;
				color: ${({ color }) => color};
				line-height: ${({ lineHeight }) => lineHeight};
				${Aside}.dragging & {
						color: inherit;
				};
		};
		${Aside}.dragging & {
				background: none;
				&.targeted {
					background: ${({ targetedBg }) => targetedBg};
					background-color: rgba(82, 0, 137, 0.2);
					border-top: 2px solid #4b2f5b;
					border-bottom: 2px solid #4b2f5b;
				};
		};
		&.dragged-clone {
			background: ${({ cloneBg }) => cloneBg};
			height: fit-content;
			* {
				color: wheat;
			};
		};
		&:hover {
				> * {
					opacity: 1;
				};
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
		cursor: pointer;
`

const Expander = styled(AccordionHeader)`
		${styles => ({ ...styles, ...iconStyles })};
		transition: transform 0.3s ease-in-out;
		cursor: pointer;
		${Aside}.dragging & {
				background: ${Bg('NavigationExpander')} center center / contain no-repeat;
		};
		${HeaderWrapper}.dragged-clone & {
				opacity: 0;
		};
`

const DragHandle = styled.div`
		${({ background, marginRight }) => ({ background, ...iconStyles, marginRight })};
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
		${Aside}.dragging & {
				opacity: 0;
		};
		${HeaderWrapper}.dragged-clone & {
				background: ${Bg('DragHandle_selected')} center center / contain no-repeat;
				opacity: 1;
		};
`

const AddElIcon = styled.button`
		${({ background }) => ({ background, ...iconStyles })};
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
		${Aside}.dragging & {
				opacity: 0 !important;
		};
`

const Content = styled(AccordionBody)`
		margin: ${({ displayed }) => displayed ? '-3px' : 0} 0;
		padding: ${({ displayed }) => displayed ? '3px' : 0} 0;
		transition: margin-top 0.3s ease-in-out, margin-bottom 0.3s ease-in-out,
														padding-top 0.3s ease-in-out, padding-bottom 0.3s ease-in-out,
														max-height 0.3s ease-in-out !important;
`

export default function Navigation() {
		const { modScheme, setModScheme } = useModSchemeContext()
		const { language } = useLanguageContext()
		const { selection, setSelection } = useSelectionContext()
		const [displayNames, setDisplayNames] = useState(JSON.parse(localStorage.getItem('displayNames')) || false)
		const draggedSourceRef = useRef(null)
		const draggedCloneRef = useRef(null)
		const droppableTargetRef = useRef(null)

		const onMouseMove = e => {
				const { clientX, clientY } = e
				const clone = draggedCloneRef.current
				if (!clone) {
						window.removeEventListener('mousemove', onMouseMove)
						window.removeEventListener('mouseup', onMouseUp)
						draggedSourceRef.current = null
						return
				}

				clone.style.transform = `translate(${clientX}px, ${clientY}px)`

				let target = e.target.classList.contains('navigation-item') ? e.target : e.target.closest('.navigation-item')

				if (!target) {
						droppableTargetRef.current = null
						document.querySelector('#navigation')?.querySelector('.targeted')?.classList.remove('targeted')
						return
				}

				if (target.dataset.navigationItemType === 'item') {
						target = target.parentElement.previousElementSibling
				}

				const { dataset: { namespace, childrenKeys } } = target

				if (namespace === droppableTargetRef.current?.namespace) return

				document.querySelector('#navigation')?.querySelector('.targeted')?.classList.remove('targeted')
				target.classList.add('targeted')
		}

		const onMouseDown = e => {
				e.preventDefault()
				const { clientX, clientY, target } = e
				if (target?.tagName === 'BUTTON') return
				const source = target.classList.contains('navigation-item') ? target : target.closest('.navigation-item')

				if (source) {
						source.closest('aside').classList.add('dragging')
						const { clientWidth, clientHeight } = source
						const { left, top } = source.getBoundingClientRect()
						const clone = source.cloneNode(true)
						source.style.opacity = 0
						clone.classList.add('dragged-clone')
						clone.style.position = 'absolute'
						clone.style.zIndex = 1000
						clone.style.left = `${parseInt(left) - clientX}px`
						clone.style.top = `${parseInt(top) - clientY}px`
						clone.style.transform = `translate(${clientX}px, ${clientY}px)`
						clone.style.minWidth = `${clientWidth}px`
						clone.style.minHeight = `${clientHeight}px`
						clone.inert = true
						document.getElementById('root').appendChild(clone)
						draggedCloneRef.current = clone
						draggedSourceRef.current = source
						window.addEventListener('mousemove', onMouseMove)
						window.addEventListener('mouseup', onMouseUp)
				}
		}

		const onMouseUp = e => {
				const source = draggedSourceRef.current
				if (source) {
						source.closest('aside').classList.remove('dragging')
						source.style.opacity = 1
						draggedSourceRef.current = null
				}

				const clone = draggedCloneRef.current
				if (clone) {
						draggedCloneRef.current = null
						clone.remove()
				}

				window.removeEventListener('mousemove', onMouseMove)
				window.removeEventListener('mouseup', onMouseUp)
		}

		if (!modScheme?.key) return <aside />
		l.setLanguage(language)

		const buildAccordionItem = (el, displayed, depth) => {
				const { key, type, items, modules, namespace, path } = el
				const onTitleClick = () => setSelection(el)
				const selected = selection?.namespace === namespace
				const expandable = !!(modules?.length || items?.length) && type !== 'item'
				const hasSelectedDescendant = expandable && !selected && selection?.namespace?.startsWith(namespace)

				const buildAccordionHeader = expanded => {
						const height = `${depth === 0 ? 35 : ((type !== 'item' || selected) ? 30 : 24)}px`
						const paddingLeft = depth === 0 ? 25 : 10
						const selectedBg = `${Bg('NavigationItem_selected')} center center / cover no-repeat`

						const wrapperStyles = {
								fontSize: `${(type === 'item' || depth > 3) ? 16 : (22 - depth * 2)}px`,
								fontWeight: type === 'item' ? 'normal' : 'bold',
								height,
								lineHeight: height,
								paddingLeft: `${paddingLeft}px`,
								color: selected ? 'wheat' : 'inherit',
								background: ((depth === 0 || displayed) && selected) ? selectedBg : 'transparent',
								margin: (type === 'item' && selected) ? '-3px 0 -3px' : '',
								targetedBg: `${Bg('Navigation' + (depth === 0 ? 'Mod' : 'Item') + '_targeted')} center center / cover no-repeat`,
								cloneBg: selectedBg
						}

						const expanderStyles = {
								background: `${Bg('NavigationExpander' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
								transform: `rotate(${expanded ? -180 : 0}deg)`
						}

						const addElIconStyles = {
								background: `${Bg('AddEl' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
						}

						const dragHandleStyles = {
								background: `${Bg('DragHandle' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
								marginRight: `${(depth - 1) * 15 + (expandable ? 5 : 15)}px`
						}

						const displayedName = displayNames ? el.localization?.Title[language] || key : key
						const onExpanderClick = e => {
								e.stopPropagation()
								if (expanded && hasSelectedDescendant) setSelection(el)
						}

						const childrenKeys = []

						if (items) childrenKeys.push(...items.map(({ key }) => key))
						if (modules) childrenKeys.push(...modules.map(({ key }) => key))

						//const onDragStart = e => {
						//		console.log('DRAGSTART!!!')
						//		//setDraggedEl({ ...el })
						//		draggedEl = { ...el }
						//		window.addEventListener('mousemove', onMouseMove)
						//		window.addEventListener('mouseup', onMouseUp)
						//		//const mask = draggedCloneRef.current
						//		//mask.innerHTML = displayedName
						//		//e.dataTransfer.setDragImage(mask, 0, 0)
						//}

						//const onDragEnd = e => {
						//		console.log('DRAGEND???')
						//		window.removeEventListener('mousemove', onMouseMove)
						//		window.removeEventListener('mouseup', onMouseUp)
						//		//setDraggedEl(null)
						//		draggedEl = null
						//}

						//const onDrop = e => {
						//		console.log('DRAGEND???')
						//		window.removeEventListener('mousemove', onMouseMove)
						//		window.removeEventListener('mouseup', onMouseUp)
						//		const { target } = e
						//		if (target.tagName === 'DIV') {
						//				target.classList?.remove('targeted')
						//		} else {
						//				target.closest('div').classList?.remove('targeted')
						//		}
						//
						//		const { namespace, ...updatedModScheme } = _.cloneDeep(modScheme)
						//		const groupName = `${draggedEl.type}s`
						//		const { path: draggedElPath, namespace: draggedElNamespace, ...draggedElData } = draggedEl
						//		const { path: _p, namespace: _n, ...elData } = el
						//		if (!el[groupName]) el[groupName] = []
						//		if (path?.length) {
						//				_.update(updatedModScheme, path, () => ({
						//						...elData,
						//						[groupName]: [...el[groupName], draggedElData]
						//				}))
						//		} else {
						//				if (!updatedModScheme[groupName]) updatedModScheme[groupName] = []
						//				updatedModScheme[groupName].push(draggedElData)
						//		}
						//		if (selection?.namespace.startsWith(draggedElNamespace)) setSelection(el)
						//		_.unset(updatedModScheme, draggedElPath)
						//		_.update(updatedModScheme, draggedElPath.slice(0, -3), children => children.filter(child => child))
						//		//setDraggedEl(null)
						//		draggedEl = null
						//		setModScheme(updatedModScheme)
						//}

						//const onDragOver = e => {
						//		if (type === 'item') return
						//		if (namespace.startsWith(draggedEl.namespace)) return
						//		if (childrenKeys.includes(draggedEl.key)) return
						//		const { target } = e
						//
						//		if (target.tagName === 'DIV') {
						//				target.classList?.add('targeted')
						//		} else {
						//				target.closest('div').classList?.add('targeted')
						//		}
						//
						//		e.preventDefault()
						//		e.stopPropagation()
						//}
						//
						//const onDragLeave = e => {
						//		const { target } = e
						//
						//		if (target.tagName === 'DIV') {
						//				target.classList?.remove('targeted')
						//		} else {
						//				target.closest('div').classList?.remove('targeted')
						//		}
						//}

						const onAddElClick = e => {
								console.log(el)
						}

						//onDragOver = { onDragOver }
						//onDragLeave = { onDragLeave }
						//onDragStart = { onDragStart }
						//onDragEnd = { onDragEnd }
						//	onDrop = { onDrop }	draggable={!!depth}
						//onMouseDown = { onMouseDown }

						return (
								<HeaderWrapper
										data-path={path}
										data-namespace={namespace}
										data-navigation-item-type={type}
										data-children-keys={childrenKeys.join(',')}
										className='navigation-item'
										{...wrapperStyles}>
										{depth !== 0 &&
												<DragHandle
														onMouseDown={onMouseDown}
														{...dragHandleStyles} />}
										{expandable &&
												<Expander
														onClick={onExpanderClick}
														{...expanderStyles} />}
										<Title onClick={onTitleClick}>
												{type === 'item' ?
														<span>{displayedName}</span> :
														<h3>{displayedName}</h3>}
										</Title>
										{type !== 'item' &&
												<AddElIcon
														onClick={onAddElClick}
														{...addElIconStyles} />}
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
												<Content displayed={open}>
														{['modules', 'items'].map(group => {
																return el[group]?.map((subEl, index) => {
																		return buildAccordionItem({ ...subEl, namespace: `${namespace}.${subEl.key}`, path: (path ? `${path}.` : '') + `${group}[${index}]` }, displayed && open, depth + 1)
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
				<Aside as='aside' id='navigation'>
						<SectionHeading>{l.navigation}</SectionHeading>
						<Button btn='LongSwitch' onClick={onDisplayModeSwitchClick} styles={switchStyles}>
								{displayNames ? l.displayKeys : l.displayNames}
						</Button>
						{buildAccordionItem({ ...modScheme, namespace: modScheme.key, path: '' }, true, 0)}
				</Aside>
		)
}

				//{(displayNames && draggedEl?.localization?.Title?.[language]) || draggedEl?.key || ''}