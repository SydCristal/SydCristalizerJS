import { useState } from 'react'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { LanguageSwitch } from './LanguageSwitch'
import styled from 'styled-components'
import { SchemeDownloader, ProjectDownloader, SchemeUploader } from './'
import { Button, ButtonGroup } from '../UI'
import { Bg, KEY_REGEXP } from '../../Utils'
import { l } from './Localization'

const StlHeader = styled.header`
		background: ${Bg('Header')} center bottom / cover no-repeat;
		height: 70px;
		width: 100%;
		padding: 0 5% 15px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		> div {
			flex: 1;
			display: flex;
			flex-direction: row;
			justify-content: center;
			&:first-child {
				justify-content: flex-start;
			};
			&:last-child {
				justify-content: flex-end;
			};
		}
`

const Heading = styled.h1`
		background: ${Bg('Bloodshed')} right center / cover no-repeat;
		font-size: 26px;
		margin: 0px 0px -15px -55px;
		color: wheat;
		text-align: left;
		height: 65px;
		padding-bottom: 15px;
		line-height: 50px;
		width: 300px;
		padding-left: 45px;
}
`

const Input = styled.input`
		border: none;
		background: ${Bg('ModKeyInput')} center center / contain no-repeat;
		height: 50px;
		width: 325px;
		font-size: 22px;
		font-weight: bold;
		padding: 0px 15px;
		text-align: center;
		&:focus-visible {
				outline: none;
  }
`

export default function Header() {
		const { language } = useLanguageContext()
		const { modScheme, setModScheme } = useModSchemeContext()
		const { setSelection } = useSelectionContext()
		const [modKey, setModKey] = useState(modScheme?.key || '')
		const disabled = !modScheme?.key
		l.setLanguage(language)

		const onClearButtonClick = () => {
				setModScheme(null)
				setSelection(null)
				setModKey('')
		}

		const onModKeyChange = value => {
				if (!KEY_REGEXP.test(value) && value !== '') return

				setModKey(value)
		}

		const onEnterModKey = () => {
				if (modKey === '') return

				setModScheme({
						...modScheme,
						key: modKey,
						namespace: modKey,
						type: 'mod',
						localization: {
								Title: {
										enGB: 'SydCristalizer',
										ruRU: 'SydCristalизатор'
								}
						},
						menu: [],
						modules: [{
								key: 'Zorg',
								type: 'module',
								modules: [{
										key: 'Jog',
										type: 'module'
								}],
								items: [{
										key: 'HOBOROBOT666',
										type: 'item'
								}, {
										key: 'Bleurge',
										type: 'item'
										}]
						}, {
								key: 'Bleurge',
								type: 'module'
						}, {
								key: 'Jog',
								type: 'module'
						}]
				})
		}

		const onModKeyInput = ({ key, target }) => {
				if (key === 'Enter') {
						onEnterModKey()
						target.blur()
				}
		}

		return (
				<StlHeader>
						<div>
								<Heading>SydCristalizer</Heading>
						</div><div>
								{!modScheme?.key &&
								<Input
										placeholder={l.modKeyPlaceholder}
										value={modKey}
										onChange={({ target: { value } }) => onModKeyChange(value)}
										onBlur={onEnterModKey}
										onKeyDown={onModKeyInput} />}
						</div><div>
								<ButtonGroup>
										<LanguageSwitch />
										<SchemeDownloader disabled={disabled} />
										<ProjectDownloader disabled={disabled} />
										<Button
												btn='DownloadLib'
												disabled={true}
												onClick={() => { }} />
										{modScheme?.key ? <Button btn='Clear' onClick={onClearButtonClick} /> : <SchemeUploader />}
								</ButtonGroup>
						</div>
				</StlHeader>
		)
}