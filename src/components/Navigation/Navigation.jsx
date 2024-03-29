﻿import { l } from './'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { CreationModal } from '../Modals/CreationModal'
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from 'react-headless-accordion'
import { Bg, Icn, getIndexFromPath, getGroupPath, sortGroup, getPathFromNameSpace, CONTENT_GROUPS } from '../../Utils'
import styled, { css } from 'styled-components'
import { SectionHeading, Button } from '../UI'
import { get, cloneDeep, update } from 'lodash'
import { useState, useRef, useEffect } from 'react'

const Aside = styled(Accordion)`
		nav {
				overflow-y: scroll;
				max-height: 60vh;
				padding-right: 20px;
				display: flex;
				flex-direction: column;
				height: 100%;
		};
`

const HeaderWrapper = styled.div`
		${({ cloneBg, ...styles }) => ({ ...styles })};
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
										background: ${Icn('Clear_selected')} center top / cover no-repeat;
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
				background: ${Icn('NavigationExpander')} center center / contain no-repeat;
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
				background: ${Icn('DragHandle_selected')} center center / contain no-repeat;
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
		&.fully-displayed {
			overflow: visible !important;
		};
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

		const clearTransformation = () => {
				transformedElements.forEach(el => { el.style.removeProperty('transform') })
				transformedElements = []
		}

		useEffect(() => {
				if (!selection || currentSelection === selection) return

				currentSelection = selection

				const selectionArr = selection.split('.')
				let current = ''
				for (let i = 0; i < selectionArr.length - 1; i++) {
						if (!current) current = selectionArr[i]
						else current += `.${selectionArr[i]}`
						const header = document.getElementById(`${current}-header`)
						if (header?.dataset?.expanded === 'false') {
								header.querySelector('.expander')?.click()
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
		const controlCount = modScheme.menu.controls?.length || 0

		const checkIfIsExpanded = el => el?.dataset?.expanded === 'true'

		const checkIfIsRoot = id => ['menu-header', 'mod-header'].includes(id)

		const getDestinationInfo = (isMenuEntity, isDraggedDown, source, target) => {
				const { dataset: { itemType: sourceType, path: sourcePath } } = source
				const { id: targetId, dataset: { path: targetPath, itemType: targetType, index: targetIndex } } = target
				const childrenKeys = (target.dataset.childrenKeys !== '' && target.dataset.childrenKeys?.split(',')) || []
				const targetParent = target.parentElement?.previousElementSibling
				const targetIsRoot = checkIfIsRoot(targetId)
				const targetGroupPath = getGroupPath(targetPath)
				const targetInnerIndex = getIndexFromPath(targetPath)
				const prevPath = prevTarget?.dataset?.path || sourcePath
				let destination
				let destinationIndex
				let destinationPath
				let destinationParent
				let unavailableKeys = []

				if (isMenuEntity) {
						if (sourceType === 'subHeader') {
								if (targetType === 'subHeader') {
										destinationIndex = targetIndex
										destinationPath = targetPath
										if (isDraggedDown && checkIfIsExpanded(target)) {
												if (prevPath.startsWith(`${targetPath}.`)) {
														destinationIndex = +targetIndex - 1
														destinationPath = `${targetGroupPath}[${targetInnerIndex - 1}]`
														destination = target.previousElementSibling.previousElementSibling
												} else {
														destination = target.nextElementSibling.lastChild.previousElementSibling
												}
										} else destination = target
								} else {
										if (targetIsRoot || checkIfIsRoot(targetParent?.id)) {
												destination = document.getElementById('menu.subHeaders[0]-header')
												destinationIndex = destination.dataset.index
												destinationPath = destination.dataset.path
										} else {
												destination = isDraggedDown ? target.parentElement.lastChild.previousElementSibling : targetParent
												destinationIndex = targetParent.dataset.index
												destinationPath = targetParent.dataset.path
										}
								}
						} else {
								if (targetIsRoot) {
										unavailableKeys = childrenKeys
										destination = document.getElementById('menu.controls[0]-header') || document.getElementById('menu.subHeaders[0]-header')
										destinationIndex = 1
										destinationPath = 'menu.controls[0]'
								} else {
										if (targetType === 'subHeader') {
												if (isDraggedDown) {
														unavailableKeys = childrenKeys
														destinationPath = `${targetPath}.controls[${checkIfIsExpanded(target) ? 0 : childrenKeys.length}]`
												} else {
														if (targetInnerIndex) {
																destinationParent = document.getElementById(`menu.subHeaders[${targetInnerIndex - 1}]-header`)
														} else {
																destinationParent = document.getElementById('menu-header')
														}
														unavailableKeys = (destinationParent.dataset.childrenKeys !== '' && destinationParent.dataset.childrenKeys?.split(',')) || []
														destinationPath = `${destinationParent.dataset.path}.controls[${checkIfIsRoot(destinationParent?.id) ? controlCount : unavailableKeys.length}]`
												}
										} else {
												unavailableKeys = targetParent.dataset.childrenKeys?.split(',')
												destinationPath = isDraggedDown && (targetGroupPath !== getGroupPath(sourcePath)) ? `${targetGroupPath}[${targetInnerIndex + 1}]` : targetPath
										}
										destination = target
										destinationIndex = destination.dataset.index
								}
						}
				} else {
						if (targetType === 'configurator') {
								destination = targetParent
						} else {
								destination = target	
						}

						destinationIndex = destination.dataset.index
						destinationPath = `${destination.dataset.path}.${sourceType}s[0]`
						unavailableKeys = destination.dataset.childrenKeys?.split(',')
				}

				return { destination, destinationIndex, destinationPath, unavailableKeys }
		}

		const onMouseMove = e => {
				const { clientX, clientY } = e
				const clone = draggedCloneRef.current

				if (!clone) {
						window.removeEventListener('mousemove', onMouseMove)
						window.removeEventListener('mouseup', onMouseUp)
						draggedSourceRef.current = null
						return
				}

				const source = draggedSourceRef.current
				const content = source.closest('section').lastChild.childNodes
				const { offsetHeight: sourceHeight, dataset: { key, path: sourcePath, itemType: sourceType, index: sourceIndex } } = source
				const sourceParent = source.parentElement.previousElementSibling

				const displayError = msg => {
						clone.classList.add('error-tooltip')
						clone.querySelector('.error-tooltip-content').querySelector('span').textContent = l[msg]
				}

				const clearDnD = () => {
						prevTarget = null
						clearTransformation()
						removeTarget()
						source.classList.add('targeted')
						clone.classList.remove('error-tooltip')
				}

				const sectionId = source.closest('section').id
				const isMenuEntity = sectionId === 'mod-menu-navigation-section'
				clone.style.transform = `translate(${clientX}px, ${clientY}px)`

				if (!e.target?.tagName || !(sectionId === e.target.closest('section')?.id)) return clearDnD()

				let target = e.target.classList?.contains('navigation-item') ? e.target : e.target.closest('.navigation-item')

				if (!target) return clearDnD()

				const { id: targetId, dataset: { path: targetPath, index: targetIndex } } = target

				if (prevTarget?.id === targetId) return

				clone.classList.remove('error-tooltip')

				const isDraggedDown = targetIndex > sourceIndex

				const { destination, destinationIndex, destinationPath, unavailableKeys } = getDestinationInfo(isMenuEntity, isDraggedDown, source, target)

				prevTarget = target

				clearTransformation()

				if (isMenuEntity) {
						const displayedContent = document.getElementsByClassName('fully-displayed')
						for (let i = 0; i < displayedContent.length; i++) displayedContent[i].classList.remove('fully-displayed')
				}

				if (!isMenuEntity && (sourcePath === targetPath || sourceParent?.dataset?.path === targetPath)) return clearDnD()

				if (isMenuEntity) {
						const startingIndex = isDraggedDown ? +sourceIndex + 1 : +destinationIndex
						const endingIndex = isDraggedDown ? +destinationIndex : +sourceIndex - 1

						const translateElement = item => {
								const child = item?.firstChild
								if (!child) return
								const { itemType } = item.dataset
								let marginFix 

								if (sourceType === 'control' && itemType === 'subHeader') {
										const parentShift = 6 * (isDraggedDown ? 1 : -1)
										item.style.transform = `translateY(${parentShift}px)`
										marginFix = 0
										transformedElements.push(item)
								} else marginFix = sourceType === 'control' ? 6 : 0
								
								const childShift = (sourceHeight - marginFix) * (isDraggedDown ? -1 : 1)
								child.style.transform = `translateY(${childShift}px)`
								transformedElements.push(child)
						}

						const translateContent = arr => {
								let suspendedTranslations = []
								for (let i = 0; i < arr.length; i++) {
										const item = arr[i]
										const { dataset: { index: itemIndex, itemType } } = item

										if (itemIndex) {
												if (itemIndex >= startingIndex && itemIndex <= endingIndex) {
														if (sourceType === 'control' && itemType === 'subHeader') {
																if (isDraggedDown) {
																		if (!checkIfIsExpanded(item)) {
																				suspendedTranslations.push(item)
																				continue
																		} else suspendedTranslations.forEach(child => translateElement(child))
																} else {
																		if (+itemIndex === startingIndex && i >= 2) {
																				const prevItem = arr[i - 2]
																				if (prevItem.dataset.itemType === 'subHeader' && !checkIfIsExpanded(prevItem)) {
																						translateElement(prevItem)
																				}
																		}
																}
														}
														translateElement(item)
												}
										} else {
												const subHeader = arr[i - 1]
												const subHeaderIndex = subHeader?.dataset?.index
												if (!checkIfIsExpanded(subHeader)) continue

												const shouldTranslateWholeContent = isDraggedDown && sourceType === 'subHeader' && subHeaderIndex <= endingIndex && subHeaderIndex >= startingIndex

												item.classList.add('fully-displayed')
												if (shouldTranslateWholeContent) {
														item.childNodes.forEach(child => translateElement(child))
												} else {
														translateContent(item.childNodes)
												}
										}
								}
						}

						clearTransformation()

						translateContent(content)
				}

				if (getGroupPath(sourcePath) !== getGroupPath(destinationPath)) {
						if (destinationPath.startsWith(`${sourcePath}.`)) {
								displayError('recursionIsNotAllowed')
						} else {
								if (unavailableKeys.includes(key)) displayError('targetContainsKey')
						}
				}

				document.getElementById('navigation')?.querySelector('.targeted')?.classList.remove('targeted')
				destination.classList.add('targeted')
				droppableTargetRef.current = destinationPath
		}

		const onMouseDown = e => {
				e.preventDefault()
				e.stopPropagation()
				const { clientX, clientY, target } = e
				if (target?.tagName === 'BUTTON') return
				const source = target.classList.contains('navigation-item') ? target : target.closest('.navigation-item')

				if (source) {
						source.closest('aside').classList.add('dragging')
						if (source?.dataset?.itemType === 'subHeader') source.nextSibling.style.display = 'none'
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
				clearTransformation()
				let hasError
				const displayedContent = document.getElementsByClassName('fully-displayed')
				for (let i = 0; i < displayedContent.length; i++) { displayedContent[i].classList.remove('fully-displayed') }
				let source = draggedSourceRef.current
				if (source) {
						source.closest('aside').classList.remove('dragging')
						source.classList.remove('dragged-source')
						source.nextSibling.style.display = 'block'
						draggedSourceRef.current = null
				}

				const clone = draggedCloneRef.current
				if (clone) {
						hasError = clone.classList?.contains('error-tooltip')
						draggedCloneRef.current = null
						clone.remove()
				}

				let targetPath = droppableTargetRef.current
				removeTarget()

				if (source && targetPath && !hasError) {
						const sectionId = source.closest('section').id
						const isMenuEntity = sectionId === 'mod-menu-navigation-section'
						const { dataset: { key: sourceKey, path: sourcePath, itemType: sourceType } } = source
						const updatedModScheme = cloneDeep(modScheme)
						const sourceObj = cloneDeep(get(updatedModScheme, sourcePath))
						const sourceGroupPath = getGroupPath(sourcePath)
						if (isMenuEntity) {
								const targetGroupPath = getGroupPath(targetPath)
								const targetInnerIndex = getIndexFromPath(targetPath)
								let targetArr = get(modScheme, targetGroupPath) || []
								if (targetGroupPath === sourceGroupPath) {
										targetArr = targetArr.filter(({ key }) => key !== sourceKey)
								} else {
										const sourceArr = get(modScheme, sourceGroupPath).filter(({ key }) => key !== sourceKey)
										update(updatedModScheme, sourceGroupPath, () => sourceArr)
								}

								targetArr.splice(targetInnerIndex, 0, sourceObj)
								update(updatedModScheme, targetGroupPath, () => targetArr)
								setModScheme(updatedModScheme)
								setSelection(targetPath)
						} else {
								const sourceGroup = `${sourceType}s`
								let updatedObj
								let index
								targetPath = targetPath.split('.').slice(0, -1).join('.')

							 update(updatedModScheme, targetPath, targetObj => {
										updatedObj = cloneDeep(targetObj)
										if (updatedObj[sourceGroup]) {
												updatedObj[sourceGroup] = [...updatedObj[sourceGroup], sourceObj].sort((a, b) => sortGroup(sourceGroup, a, b))
												index = updatedObj[sourceGroup].findIndex(({ key }) => key === sourceKey)
										} else {
												updatedObj[sourceGroup] = [sourceObj]
												index = 0
										}

										return updatedObj
								})

								update(updatedModScheme, sourceGroupPath, arr => arr.filter(({ key }) => key !== sourceKey))
								const newModScheme = setModScheme(updatedModScheme)
								const target = document?.getElementById(`${targetPath}-header`)
								const targetNameSpace = target?.dataset?.nameSpace
								setSelection(getPathFromNameSpace(newModScheme, `${targetNameSpace}.${sourceKey}`))
						}
				}

				window.removeEventListener('mousemove', onMouseMove)
				window.removeEventListener('mouseup', onMouseUp)
		}

		const buildAccordionItem = (el, displayed = true, depth = 0) => {
				const { key, type, index, configurators, modules, subHeaders, controls, path, nameSpace = modScheme.key } = el
				const onTitleClick = () => setSelection(path)
				const selected = selection === path
				const hasSelectedDescendant = !selected && selection?.startsWith(path)
				const expandable = !!(modules?.length || configurators?.length || subHeaders?.length || controls?.length)

				const buildAccordionHeader = expanded => {
						const height = `${depth === 0 ? 35 : 30}px`
						const paddingLeft = depth === 0 ? 25 : 10
						const selectedBg = `${Bg('NavigationItem_selected')} center center / cover no-repeat`
						const displayedName = (displayNames && el.localization?.Title[language]) || (type === 'mod' && modScheme.key) || (key === 'menu' && 'Mod Menu') || key
						const isLeaf = type === 'control' || type === 'configurator'

						const wrapperStyles = {
								background: (displayed && selected) ? selectedBg : 'transparent',
								margin: `${isLeaf ? -3 : 0}px 0`,
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
								background: `${Icn('NavigationExpander' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
								transform: `rotate(${expanded ? -180 : 0}deg)`
						}

						const addElIconStyles = {
								background: `${Icn('AddEl' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
						}

						const dragHandleStyles = {
								background: `${Icn('DragHandle' + (selected ? '_selected' : ''))} center center / contain no-repeat`,
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
						if (subHeaders) childrenKeys.push(...subHeaders.map(({ key }) => key))
						if (controls) childrenKeys.push(...controls.map(({ key }) => key))

						const onAddElClick = e => {
								e.preventDefault()
								e.stopPropagation()
								e.target.blur()
								setAddELProps(el)
						}

						return (
								<HeaderWrapper
										data-index={index}
										data-name-space={nameSpace}
										data-key={key}
										data-path={path}
										data-item-type={type}
										data-children-keys={childrenKeys.join(',')}
										data-expanded={expandable && expanded ? 'true' : 'false'}
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
																className={`expander expander-${expanded ? 'up' : 'down'}`}
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
												{CONTENT_GROUPS.map(groupName => {
														return el[groupName]?.map((subEl, index) => {
																subEl = {
																		...subEl,
																		path: `${path}.${groupName}[${index}]`,
																		nameSpace: `${nameSpace}.${subEl.key}`
																}
																return buildAccordionItem(subEl, displayed && open, depth + 1)
														})
												})}
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
						</Button><nav>
								<section id='mod-structure-navigation-section'>
										{buildAccordionItem(mod)}
								</section><section id='mod-menu-navigation-section'>
										{buildAccordionItem(menu)}
								</section></nav>
				</Aside>
		)
}