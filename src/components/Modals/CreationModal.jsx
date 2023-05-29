import ReactModal from 'react-modal'
import styled, { css } from 'styled-components'
import { useLanguageContext } from '../../contexts/LanguageContext'
import { useCreationContext } from '../../contexts/CreationContext'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'
import { useSelectionContext } from '../../contexts/SelectionContext'
import { l } from './'
import { Bg, KEY_REGEXP } from '../../Utils'
import _ from 'lodash'
import { SelectInput, TextInput } from '../UI'
import { useState } from 'react'

const Modal = styled(ReactModal)`
		background: ${Bg('CreationModal')} center center / cover no-repeat;
  width: 340px;
  height: 220px;
  top: 50%;
  left: 50%;
		position: fixed;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: none;
		&:focus-visible {
    outline: none;
  }
 `

const expander = css`;
  background: ${Bg('CreationModalSelectExpander')} center center / cover no-repeat;
  top: 42px;
  width: 25px;
  height: 25px;
  transition: transform 0.3s ease-in-out;
  content: '';
  position: absolute;
`

const Header = styled.header`
  height: 105px;
  margin-top: 3px;
  > div {
    height: 100%;
    > div {
      &:first-child {
        padding: 25px 50px;
        height: 100%;
        width: 100%;
        text-align: center;
        z-index: 1;
        background: ${Bg('CreationModalSelectInput')} center center / cover no-repeat;
        &::before {
          ${expander};
          left: 13px;
        };
        &::after {
          ${expander};
          right: 12px;
        };
      };
      &:last-child {
        left: 25px;
        width: calc(100% - 50px);
        top: 90px;
        max-height: ${({ optionsCount }) => 35 + optionsCount * 35}px;
        li {
          height: 35px;
          line-height: 35px;
          font-size: 18px;
          font-weight: bold;
          &:hover {
            background: ${Bg('CreationModalSelectHoveredItem')} center center / contain no-repeat;
          };
        };
      };
    };
    &.expanded {
      > div:first-child {
        &::before {
          transform: rotate(180deg);
        };
        &::after {
          transform: rotate(-180deg);
        };
      };
    };
    &.disabled {
      > div:first-child {
        p {
          color: wheat;
        };
        &::before,
        &::after {
          background: ${Bg('CreationModalSelectError')} center center / cover no-repeat;
        };
      };
      &::before {
        content: '';
        position: absolute;
        background: ${Bg('ErrorTooltip')} center center / cover no-repeat;
        background-color: #51000073;
        top: 20px;
        left: 25px;
        width: 290px;
        height: 65px;
      }
    }
  };
`

const Content = styled.section`
  padding: 0 30px;
  margin-bottom: 5px;
  input {
    background: ${Bg('CreationModalKeyInput')} bottom center / contain no-repeat;
    width: 100%;
    padding-bottom: 12px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
  };
`

const Footer = styled.footer`
  background: ${Bg('CreationModalFooter')} center center / cover no-repeat;
  height: 50px;
  margin: 0px 10px 15px;
  padding: 10px 15px;
  display: flex;
  flex-direction: row;
  > button {
    flex: 1;
    height: 100%;
    border: none;
    font-weight: bold;
    font-size: 16px;
    &:first-child {
      border-right: 2px solid rgb(55, 56, 71);
      background-color: #80000059;
      cursor: pointer;
      &:hover {
        color: wheat;
        background-color: #800000a6;
      };
    };
    &:last-child {
      &:disabled {
        background-color: #808080b5;
        color: rgba(98, 98, 98, 0.75);
      };
      &:not(:disabled) {
        background-color: rgba(106, 50, 92, 0.5);
        cursor: pointer;
        &:hover {
          color: wheat;
          background-color: rgba(106, 50, 92, 0.75);
        };
      };
    };
  };
`

export function CreationModal() {
		const { language } = useLanguageContext()
		const { creation, setCreation } = useCreationContext()
		const { modScheme, setModScheme } = useModSchemeContext()
		const { setSelection } = useSelectionContext()
		const [newItemType, setNewItemType] = useState(null)
		const [newItemKey, setNewItemKey] = useState('')
  const { path, modules = [], items = [], entries = [], type } = creation
		const controls = [...(creation?.controls || []), ...(_.reduce(entries, (result, { controls }) => { return [...result, ...controls] }, []))]
		const unavailableKeys = [...modules, ...items, ...controls].map(({ key }) => key)

		l.setLanguage(language)
		let options = []
		let label = (type === 'module' && newItemType === 'module' && l.subModule) || l[newItemType] || newItemType || ''
		let moduleLabel = l.subModule

		switch (type) {
				case 'mod':
						moduleLabel = l.module
				case 'module':
						options = [{
								value: 'module',
								label: moduleLabel
						}, {
								value: 'item',
								label: l.item
						}]
						break
				case 'menu':
						options = [{
								value: 'entity',
								label: l.subHeader
						}]
				case 'entity':
						options.push({
								value: 'switch',
								label: l.switch
						})
						break
				default: break
		}

		const closeModal = () => {
				setNewItemType(null)
				setNewItemKey('')
				setCreation(null)
		}

		const onDropdownClose = target => {
				if (!target) return
				if (target.closest('.ReactModalPortal') && !target.closest('.ReactModal__Content')) closeModal()
		}

		const keyIsUnvailable = unavailableKeys.includes(newItemKey)
		const groupName = `${newItemType}s`

		label = keyIsUnvailable ? l.keyIsUnvailable : (label ? `${l.new} ${(label || newItemType).toLowerCase()}` : '')
		const disabled = !newItemType || !newItemKey || keyIsUnvailable
		const createNewItem = () => {
				if (disabled) return
				let updatedModScheme = _.cloneDeep(modScheme)
    _.update(updatedModScheme, path, obj => {
      const newItem = { key: newItemKey, type: newItemType }
      if (!obj[groupName]) {
        obj[groupName] = [newItem]
      } else {
        obj[groupName].push(newItem)
      }

      return obj
    })

    const newSelection = {
      key: newItemKey,
      type: newItemType,
      path: `${path}.${groupName}[${(creation[groupName]?.length || 1) - 1}]`
    }

    closeModal()
				setModScheme(updatedModScheme)
    setSelection(newSelection)
  }

		return (
				<Modal
						appElement={document.getElementById('root')}
						isOpen={true}
						onRequestClose={closeModal}
						style={{ overlay: { backgroundColor: 'rgba(15, 10, 20, 0.65)', zIndex: 1 } }}>
						<Header optionsCount={options?.length || 0}>
								<SelectInput
										onDropdownClose={onDropdownClose}
										value={newItemType}
										label={label}
										setValue={setNewItemType}
										placeholder={l.selectNewItemType}
										options={options}
										disabled={keyIsUnvailable} />
						</Header>
      {newItemType &&
      <Content>
						  <TextInput
						  		value={newItemKey}
						  		setValue={setNewItemKey}
						  		placeholder={l.enterNewItemKey}
						  		onPressEnter={createNewItem}
						  		regexp={KEY_REGEXP} />
						</Content>}
						<Footer>
								<button key='cancel' onClick={closeModal}>{l.cancel}</button>
								<button key='confirm' onClick={createNewItem} disabled={disabled} >{l.confirm}</button>
						</Footer>
				</Modal>
		)
}