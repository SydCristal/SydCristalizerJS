import styled from 'styled-components'

const Input = styled.input`
  border: none;
  background-color: transparent;
  &: focus-visible {
    outline: none
  };
`

export function TextInput({ id, value, setValue, regexp, placeholder, disabled, onPressEnter, onBlur = () => { }, capitalize }) {
  const onChange = ({ target: { value } }) => {
    if (regexp && !regexp.test(value) && value !== '') return
    if (capitalize && value !== '') value = `${value[0].toUpperCase()}${value.slice(1)}`

    setValue(value)
  }

  const onKeyDown = ({ key, target }) => {
    if (key === 'Enter' && onPressEnter) {
      target.blur()
      onPressEnter()
    }
  }

  const inputProps = { id, disabled, placeholder, value, onKeyDown, onBlur, onChange }

  return (
    <Input {...inputProps} />
  )
}