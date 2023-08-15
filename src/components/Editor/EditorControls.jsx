import { TextInput } from '../UI'
import { KEY_REGEXP, CONTENT_GROUPS } from '../../Utils'
import { useState, useEffect } from 'react' 
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useEditionContext } from '../../contexts/EditionContext'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { get, cloneDeep, update } from 'lodash'
import { l } from './'
import styled from 'styled-components'
import { SectionHeading } from '../UI'

const StlControls = styled.div`
		display: flex;
		justify-content: space-between;
		align-items: center;
		input {
			 height: 40px;
		}
`
export function EditorControls() {
		const { modScheme, setModScheme } = useModSchemeContext()
		const { selection } = useSelectionContext()
		const { edition, setEdition } = useEditionContext()
		const { language } = useLanguageContext()
		const [error, setError] = useState('')
		const object = edition || get(modScheme, selection)
		const { key: objectKey, path: objectPath } = object
		const objectParent = get(modScheme, objectPath.split('.').slice(0, -1).join('.'))
		const [value, setValue] = useState(objectKey)

		let unavailableKeys = []

		if (objectParent) {
				CONTENT_GROUPS.forEach(groupName => {
						if (objectParent[groupName]) unavailableKeys = [...unavailableKeys, ...objectParent[groupName].map(({ key }) => key).filter(key => key !== objectKey)]
				})
		}

		l.setLanguage(language)

		useEffect(() => {
				if (unavailableKeys.includes(value)) {
						setError(l.unavailableKeyError)
				} else if (value === '') {
						setError(l.emptyKeyError)
				} else if (error) setError('')
		}, [value])

		const onSetKey = () => {
				if (!!error) {
						setValue(objectKey)
						return
				}

				setEdition({ ...object, key: value })
		}

		const textInputProps = {
				value,
				setValue,
				regexp: KEY_REGEXP,
				onBlur: onSetKey,
				onPressEnter: onSetKey,
				error
		}

		return (
				<StlControls>
						<div />
						<SectionHeading>
								{edition ? <TextInput {...textInputProps} /> : l.editor}
						</SectionHeading>
						<div>
						
						</div>
				</StlControls>
		)
}