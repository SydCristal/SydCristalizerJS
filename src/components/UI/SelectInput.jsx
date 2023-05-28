import { useState } from 'react'
import styled from 'styled-components'
import { Bg } from '../../Utils'

const Select = styled.div`
  border: none;
  background-color: transparent;
  position: relative;
  &:not(.disabled) > div:first-child {
    cursor: pointer;
  };
  > div:first-child {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    p {
      font-weight: bold;
    };
  };
`

const Dropdown = styled.div`
  background: ${Bg('SelectDropdown')} center bottom / cover no-repeat;
  transition: height 0.3s ease-in-out;
  overflow: hidden;
  position: absolute;
  height: ${({ expanded }) => expanded ? '100%' : '0'};
  ul {
    position: absolute;
    left: 50%;
    translate: -50%;
    width: 85%;
    bottom: 20px;
    list-style: none;
    padding: 10px 0;
    margin: 0;
    li {
      text-align: center;
      cursor: pointer;
      font-weight: bold;
						&:hover {
        color: wheat;
      };
    };
  };
`

export function SelectInput({ placeholder, value, label, setValue, options, onOpen, onDropdownClose, disabled }) {
		const [expanded, setExpanded] = useState(false)
		const onExpanderClick = e => {
				if (disabled) return
				e.preventDefault()
				e.stopPropagation()
				if (!expanded) {
						onOpen && onOpen(e)
						setExpanded(true)
						document.addEventListener('click', ({ target }) => {
								if (!target.closest('.select-dropdown')) closeDropdown(target)
						})
				} else {
						closeDropdown()
				}
		}

		const closeDropdown = target => {
				setExpanded(false)

				onDropdownClose && onDropdownClose(target)

				document.removeEventListener('click', ({ target }) => {
						if (!target.closest('.select-dropdown')) closeDropdown(target)
				})
		}

		const onOptionClick = value => {
				closeDropdown()
				setValue(value)
		}

		return (<>
				<Select className={`select-input${expanded ? ' expanded' : ''}${disabled ? ' disabled' : ''}`}>
						<div onClick={onExpanderClick}>
								<p>{label || value || placeholder}</p>
						</div>
						<Dropdown
								expanded={expanded}
								optionCount={options?.length}
								className='select-dropdown'>
								<ul>
										{options?.map(option => (
												<li
														key={option?.value || option}
														onClick={() => onOptionClick(option?.value || option)}>
														{option?.label || option}
												</li>
										))}
								</ul>
						</Dropdown>
				</Select>
		</>)
}