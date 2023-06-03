import { l } from './Localization'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { CreationModal } from '../Modals/CreationModal'
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from 'react-headless-accordion'
import { Bg, getIndexFromPath } from '../../Utils'
import styled, { css } from 'styled-components'
import { SectionHeading, Button } from '../UI'
import _ from 'lodash'
import { useState, useRef, useEffect } from 'react'
import { getGroupPath } from '../../Utils/Functions'

const Aside = styled(Accordion)`
`

const HeaderWrapper = styled.div`
		${({ cloneBg, targetedBg, ...styles }) => ({ ...styles })};
		border: 2px solid transparent;
		position: relative;
		&.dragged-clone {
			background: ${({ cloneBg }) => cloneBg};
			height: fit-content;
			position: absolute;
			z-index: 1000;
			* {
				color: wheat;
			};
			> .error-tooltip-content {
				display: none;
			};
			&.error-tooltip {
				background: ${Bg('ErrorTooltip')} left top / cover no-repeat;
				background-color: rgba(0, 0, 0, 0.3);
				border: 2px solid maroon;
				padding: 5px 8px 8px;
				box-sizing: border-box;
				> :not(.error-tooltip-content) {
					display: none;
				};
				> .error-tooltip-content {
						display: flex;
						flex-direction: row;
						div {
								background: ${Bg('Clear_selected')} center top / cover no-repeat;
								display: inline-block;
								width: 20px;
								height: 20px;
								margin-right: 5px;
						};
						span {
							font-size: 18px;
							line-height: 18px;
						}
				};
			}
		};
		${Aside}.dragging & {
				&.dragged-source > * {
						opacity: 0;
				};
				&.dragged-clone {
						position: absolute;
						> * {
								opacity: 1;
						};
				};
				background: none;
				&.targeted {
					background-color: rgba(82, 0, 137, 0.2);
					border: 2px solid #45204e;
					&::before {
						content: '';
						background: ${Bg('DropTargetDecoration_left')} left center / contain no-repeat;
						height: 100%;
						width: 20px;
						position: absolute;
						left: 0;
						top: 0;
					};
					&::after {
						content: '';
						background: ${Bg('DropTargetDecoration_right')} right center / contain no-repeat;
						height: 100%;
						width: 20px;
						position: absolute;
						right: 0;
						top: 0;
					};
				};
		};
`

const HeaderContent = styled.div`
		${({ cloneBg, color, ...styles }) => ({ ...styles })};
		padding-right: 10px;
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
		cursor: pointer;
		border: 2px solid transparent;
		opacity: 1;
		* {
				margin: 0;
				color: ${({ color }) => color};
				font-size: ${({ fontSize }) => fontSize};
				${Aside}.dragging & {
						color: inherit;
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
		&:focus-visible {
				outline: none;
		}
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
		margin-left: 5px;
		${Aside}.dragging & {
				opacity: 0 !important;
		};
`

const Content = styled(AccordionBody)`
		margin: ${({ displayed }) => displayed ? '-3px' : 0} 0;
		padding: ${({ displayed }) => displayed ? '3px' : 0} 0;
`

export default function Navigation() {
		const { modScheme, setModScheme } = useModSchemeContext()
		const { language } = useLanguageContext()
		const { selection, setSelection } = useSelectionContext()
		const [addELProps, setAddELProps] = useState(null)
		const [displayNames, setDisplayNames] = useState(JSON.parse(localStorage.getItem('displayNames')) || false)
		const draggedSourceRef = useRef(null)
		const draggedCloneRef = useRef(null)
		const droppableTargetRef = useRef(null)
		let currentSelection
		let transformedElements = []

		const cleanTransformation = () => {
				transformedElements.forEach(el => { el.style.transform = `` })
				transformedElements = []
		}

		useEffect(() => {
				if (currentSelection === selection) {
						return
				}

				currentSelection = selection

				const selectionArr = selection.split('.')
				let current = ''
				for (let i = 0; i < selectionArr.length - 1; i++) {
						if (!current) current = selectionArr[i]
						else current += `.${selectionArr[i]}`
						const header = document.getElementById(`${current}-header`)
						if (header?.dataset?.expanded === 'false') {
								header.querySelector('button').click()
						}
				}
		}, [selection])

		if (!modScheme?.key) return <aside />

		l.setLanguage(language)

		const removeTarget = () => {
				document.querySelector('#navigation')?.querySelector('.targeted')?.classList.remove('targeted')
				droppableTargetRef.current = null
		}

		let prevTarget

		const onMouseMove = e => {
				const { clientX, clientY } = e
				const clone = draggedCloneRef.current
				const source = draggedSourceRef.current
				if (!clone) {
						window.removeEventListener('mousemove', onMouseMove)
						window.removeEventListener('mouseup', onMouseUp)
						draggedSourceRef.current = null
						return
				}

				const displayErrorTooltip = msg => {
						clone.classList.add('error-tooltip')
						clone.querySelector('.error-tooltip-content').querySelector('span').textContent = l[msg]
						removeTarget()
				}

				const { key, path: sourcePath, itemType: sourceType } = source.dataset
				let sourceIndex = getIndexFromPath(sourcePath) * 2
				const isMenuEntity = ['section', 'control'].includes(sourceType)
				clone.style.transform = `translate(${clientX}px, ${clientY}px)`

				const clearDnD = () => {
						clone.classList.remove('error-tooltip')
						removeTarget()
						source.classList.add('targeted')
						cleanTransformation()
				}

				if (!e.target?.tagName || !(source.closest('section')?.id === e.target.closest('section')?.id)) return clearDnD()

				let target = e.target.classList?.contains('navigation-item') ? e.target : e.target.closest('.navigation-item')

				if (!target) {
						if (!prevTarget) return clearDnD()
						target = prevTarget
				}

				if (target.dataset.itemType === 'configurator' || (target.dataset.itemType === 'control' && sourceType !== 'control')) {
						target = target.parentElement.previousElementSibling
				}

				const { dataset: { path: targetPath, childrenKeys, itemType: targetType } } = target

				if (prevTarget !== target) {
						if (prevTarget) prevTarget.firstChild.style.transform = `translate(0, 0)`
						prevTarget = target
				}

				if (isMenuEntity) {
						if (getGroupPath(targetPath) === getGroupPath(sourcePath)) {
								const parent = target.parentElement
								let targetIndex = 2 * getIndexFromPath(targetPath)
								const sourceHeight = source.offsetHeight

								if (targetType === 'section') {
										const controlsCount = modScheme.menu.controls?.length
										targetIndex += 2 * controlsCount
										sourceIndex += 2 * controlsCount
								}

								for (let i = 0; i < parent.childNodes.length; i++) {
										const targetWrapper = parent.childNodes[i]
										const child = targetWrapper.dataset?.itemType ? targetWrapper.firstChild : targetWrapper
										const marginFix = targetType === 'control'  ? 6 : 0
										if (!child) continue
										let shift = sourceHeight - marginFix
										if (targetIndex <= i && i < sourceIndex) {
												child.style.transform = `translate(0, ${shift}px)`
												transformedElements.push(child)
										} else if (sourceIndex < i && i <= targetIndex + 1) {
												let contentHeight = 0
												if (i % 2 === 0) {
														contentHeight = parent.childNodes[i + 1].offsetHeight
														targetWrapper.style.transform = `translate(0, ${contentHeight}px)`
														transformedElements.push(targetWrapper)
												}
												child.style.transform = `translate(0, ${-contentHeight - shift}px)`
												transformedElements.push(child)
										} else {
												child.style.transform = `translate(0, 0)`
										}
								}
						}
				}

				if (targetPath === sourcePath) return clearDnD()

				if (targetPath.startsWith(sourcePath)) {
						return displayErrorTooltip('recursionIsNotAllowed')
				}

				if (childrenKeys && childrenKeys.split(',').includes(key)) {
						const source = draggedSourceRef.current
						const { dataset: { path: parentPath } } = source.parentElement.previousElementSibling
						if (targetPath === parentPath) return clearDnD()
						return displayErrorTooltip('targetContainsKey')
				}

				document.getElementById('navigation')?.querySelector('.targeted')?.classList.remove('targeted')
				target.classList.add('targeted')
				droppableTargetRef.current = target
		}

		const onMouseDown = e => {
				e.preventDefault()
				const { clientX, clientY, target } = e
				if (target?.tagName === 'BUTTON') return
				const source = target.classList.contains('navigation-item') ? target : target.closest('.navigation-item')

				if (source) {
						source.closest('aside').classList.add('dragging')
						if (source?.dataset?.itemType === 'section') source.nextSibling.style.display = 'none'
						const { clientWidth, clientHeight } = source
						const { left, top } = source.getBoundingClientRect()
						const clone = source.cloneNode(true)
						source.classList.add('dragged-source')
						clone.classList.add('dragged-clone')
						clone.style.left = `${parseInt(left) - clientX}px`
						clone.style.top = `${parseInt(top) - clientY}px`
						clone.style.transform = `translate(${clientX}px, ${clientY}px)`
						clone.style.width = `${clientWidth}px`
						clone.style.minHeight = `${clientHeight}px`
						const tip = document.createElement('div')
						tip.classList.add('error-tooltip-content')
						tip.appendChild(document.createElement('div'))
						tip.appendChild(document.createElement('span'))
						clone.appendChild(tip)
						clone.inert = true
						document.getElementById('root').appendChild(clone)
						draggedCloneRef.current = clone
						draggedSourceRef.current = source
						window.addEventListener('mousemove', onMouseMove)
						window.addEventListener('mouseup', onMouseUp)
				}
		}

		const onMouseUp = e => {
				cleanTransformation()
				let source = draggedSourceRef.current
				if (source) {
						source.closest('aside').classList.remove('dragging')
						source.classList.remove('dragged-source')
						source.nextSibling.style.display = 'block'
						draggedSourceRef.current = null
				}

				const clone = draggedCloneRef.current
				if (clone) {
						draggedCloneRef.current = null
						clone.remove()
				}

				let target = droppableTargetRef.current
				if (target) {
						removeTarget()
				}

				if (source && target) {
						const { dataset: { key: sourceKey, path: sourcePath, itemType: sourceType } } = source
						const { dataset: { path: targetPath, itemType: targetType } } = target
						const isMenuEntity = ['section', 'control'].includes(sourceType)
						const updatedModScheme = _.cloneDeep(modScheme)
						const sourceObj = _.get(updatedModScheme, sourcePath)
						const sourceGroup = `${sourceType}s`
						if (isMenuEntity) {
								const targetArrPath = sourceType === targetType ? getGroupPath(targetPath) : `${targetPath}.${sourceGroup}`
								let targetArr = _.get(modScheme, targetArrPath) || []
								const targetIndex = sourceType === targetType ? getIndexFromPath(targetPath) : targetArr.length

								const sourceArrPath = getGroupPath(sourcePath)
								if (targetArrPath === sourceArrPath) {
										targetArr = targetArr.filter(({ key }) => key !== sourceKey)
								} else {
										const sourceArr = _.get(modScheme, sourceArrPath).filter(({ key }) => key !== sourceKey)
										_.update(updatedModScheme, sourceArrPath, () => sourceArr)
								}

								targetArr.splice(targetIndex, 0, sourceObj)
								_.update(updatedModScheme, targetArrPath, () => targetArr)
								setSelection(`${targetArrPath}[${targetIndex}]`)
						} else {
								let updatedObj

								_.update(updatedModScheme, targetPath, targetObj => {
										updatedObj = _.cloneDeep(targetObj)
										if (updatedObj[sourceGroup]) {
												updatedObj[sourceGroup].push(sourceObj)
										} else {
												updatedObj[sourceGroup] = [sourceObj]
										}

										return updatedObj
								})

								_.update(updatedModScheme, getGroupPath(sourcePath), arr => arr.filter(({ key }) => key !== sourceKey))
								setSelection(`${targetPath}.${sourceGroup}[${updatedObj[sourceGroup].length - 1}]`)
						}
						setModScheme(updatedModScheme)
				}

				window.removeEventListener('mousemove', onMouseMove)
				window.removeEventListener('mouseup', onMouseUp)
		}

		const buildAccordionItem = (el, displayed = true, depth = 0) => {
				const { key, type, configurators, modules, sections, controls, path, namespace = modScheme.key } = el
				const onTitleClick = () => setSelection(path)
				const selected = selection === path
				const hasSelectedDescendant = !selected && selection?.startsWith(path)
				const expandable = !!(modules?.length || configurators?.length || sections?.length || controls?.length) && type !== 'configurator'

				const buildAccordionHeader = expanded => {
						const height = `${depth === 0 ? 35 : 30}px`
						const paddingLeft = depth === 0 ? 25 : 10
						const selectedBg = `${Bg('NavigationItem_selected')} center center / cover no-repeat`
						const displayedName = (displayNames && el.localization?.Title[language]) || (type === 'mod' && modScheme.key) || (key === 'menu' && 'Mod Menu') || key
						const isLeaf = type === 'control' || type === 'configurator'

						const wrapperStyles = {
								background: (displayed && selected) ? selectedBg : 'transparent',
								targetedBg: `${Bg('Navigation' + (depth === 0 ? 'Mod' : 'Item') + '_targeted')} center center / cover no-repeat`,
								margin: isLeaf ? '-3px 0 -3px' : '',
								cloneBg: `${Bg('NavigationItem_selected')} center center / cover no-repeat`
						}

						const contentStyles = {
								fontSize: `${(isLeaf || depth > 3) ? 16 : (22 - depth * 2)}px`,
								fontWeight: isLeaf ? 'normal' : 'bold',
								height,
								lineHeight: height,
								paddingLeft: `${paddingLeft}px`,
								color: selected ? 'wheat' : 'inherit',
								background: 'transparent'
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
								marginRight: `${(depth - 1) * 15 + 5}px`
						}

						const onExpanderClick = e => {
								e.stopPropagation()
								e.target.style.transform = `rotate(${!expanded ? -180 : 0}deg), ${e.target.style.transform}`
								if (expanded && hasSelectedDescendant) setSelection(path)
						}

						const childrenKeys = []

						if (configurators) childrenKeys.push(...configurators.map(({ key }) => key))
						if (modules) childrenKeys.push(...modules.map(({ key }) => key))
						if (sections) childrenKeys.push(...sections.map(({ key }) => key))
						if (controls) childrenKeys.push(...controls.map(({ key }) => key))

						const onAddElClick = e => {
								e.preventDefault()
								e.stopPropagation()
								e.target.blur()
								setAddELProps(el)
						}

						return (
								<HeaderWrapper
										data-key={key}
										data-path={path}
										data-item-type={type}
										data-children-keys={childrenKeys.join(',')}
										data-expanded={expanded ? 'true' : 'false'}
										id={`${path}-header`}
										className='navigation-item'
										{...wrapperStyles}>
										<HeaderContent {...contentStyles}>
												{depth !== 0 &&
														<DragHandle
																onMouseDown={onMouseDown}
																{...dragHandleStyles} />}
												{expandable &&
														<Expander
																onClick={onExpanderClick}
																className={`expander-${expanded ? 'up' : 'down'}`}
																{...expanderStyles} />}
												<Title onClick={onTitleClick}>
														{isLeaf ?
																<span>{displayedName}</span> :
																<h3>{displayedName}</h3>}
												</Title>
												{!isLeaf &&
														<AddElIcon
																onClick={onAddElClick}
																		{...addElIconStyles} />}
										</HeaderContent>
								</HeaderWrapper>
						)
				}

				return (
						<AccordionItem
								key={key}>
								{({ open }) => (<>
										{buildAccordionHeader(open)}
										<Content displayed={open}>
												{['modules', 'configurators', 'controls', 'sections'].map(group => {
														return el[group]?.map((subEl, index) => {
																subEl = {
																		...subEl,
																		path: `${path}.${group}[${index}]`,
																		namespace: `${namespace}.${subEl.key}`
																}
																return buildAccordionItem(subEl, displayed && open, depth + 1)
														})
												})}
												<div style={{ height: '3px' }}></div>
										</Content>
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

		const { mod, menu } = modScheme

		return (
				<Aside as='aside' id='navigation' alwaysOpen={true}>
						{addELProps?.path &&
								<CreationModal
										onClose={() => setAddELProps(null)}
										{...addELProps} />}
						<SectionHeading>{l.navigation}</SectionHeading>
						<Button btn='LongSwitch' onClick={onDisplayModeSwitchClick} styles={switchStyles}>
								{displayNames ? l.displayKeys : l.displayNames}
						</Button>
						<section id='mod-structure-navigation-section'>
								{buildAccordionItem(mod)}
						</section><section id='mod-menu-navigation-section'>
								{buildAccordionItem(menu)}
						</section>
				</Aside>
		)
}