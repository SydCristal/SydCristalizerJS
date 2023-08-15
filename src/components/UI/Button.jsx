import styled, { css } from 'styled-components'
import { Btn, Crs } from '../../Utils'

const getBtn = ({ btn, disabled, hovered }) => `${Btn((btn || 'Empty') + (disabled ? '_disabled' : (hovered ? '_hovered' : '')))} center center / contain no-repeat`

const styles = css`
  background: ${getBtn};
		color: wheat;
  min-width: 35px;
  min-height: 35px;
  border: none;
		cursor: ${({ disabled }) => disabled ? Crs('CursorDisabled') + ', not-allowed' : 'pointer'};
		text-align: center;
  &:hover {
    background: ${props => getBtn({ ...props, hovered: true })};
  };
		${props => ({ ...props.styles })};
`

const StlButton = styled.button`${() => styles}`
const StlLabel = styled.label`${() => styles}`
const StlText = styled(StlButton)`
		width: 58px;
		font-size: 16x;
`

export function Button({ btn, onClick, disabled, children, tag = 'button', styles = {} }) {
		const onButtonClick = e => {
				if (tag !== 'label') e.preventDefault()
				onClick && onClick()
		}

		let Sbtn

		switch (tag) {
				case 'label':
						Sbtn = StlLabel
						break
				default:
						Sbtn = btn === 'TextButton' ? StlText : StlButton
		}

		return (
				<Sbtn onClick={onButtonClick} btn={btn} styles={styles} disabled={disabled}>{children}</Sbtn>
		)
}