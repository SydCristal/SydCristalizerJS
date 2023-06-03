import { useState } from 'react'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { LanguageSwitch } from './LanguageSwitch'
import styled from 'styled-components'
import { SchemeDownloader, ProjectDownloader, SchemeUploader } from './'
import { Button, ButtonGroup, TextInput } from '../UI'
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

const KeyInputWrapper = styled.div`
		input {
				background: ${Bg('ModKeyInput')} center center / contain no-repeat;
				height: 50px;
				width: 325px;
				font-size: 22px;
				font-weight: bold;
				padding: 0px 15px;
				text-align: center;
		};
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
				setSelection('')
				setModKey('')
		}

		const onSetModKey = () => {
				if (modKey === '') return

				setModScheme({
						key: modKey,
						mod: {
								key: 'mod',
								type: 'mod',
								path: 'mod'
						},
						menu: {
								key: 'menu',
								type: 'menu',
								path: 'menu'	
						}
				})

				setSelection('mod')
		}

		return (
				<StlHeader>
						<div>
								<Heading>SydCristalizer</Heading>
						</div><KeyInputWrapper>
								{!modScheme?.key &&
								<TextInput
										placeholder={l.modKeyPlaceholder}
										value={modKey}
										capitalize={true}
										setValue={setModKey}
										regexp={KEY_REGEXP}
										onBlur={onSetModKey}
										onPressEnter={onSetModKey} />}
						</KeyInputWrapper><div>
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