import styled from 'styled-components'

const Input = styled.input`
  border: none;
  background-color: transparent;
  &: focus-visible {
    outline: none
  };
`

export function TextInput({ value, setValue, regexp, placeholder, disabled, onPressEnter }) {
  const onChange = ({ target: { value } }) => {
    if (regexp && !regexp.test(value) && value !== '') return

    setValue(value)
  }

  const onKeyDown = ({ key, target }) => {
    if (key === 'Enter' && onPressEnter) {
      target.blur()
      onPressEnter()
    }
  }

  return (
    <Input
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onKeyDown={onKeyDown}
      onChange={onChange} />
  )
}