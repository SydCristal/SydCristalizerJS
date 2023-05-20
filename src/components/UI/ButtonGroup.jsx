import styled from 'styled-components'
import { Bg } from '../../Utils'

const Wrapper = styled.div`
		display: flex;
		position: relative;
		width: fit-content;
		button:not(:last-child) {
				margin-right: ${({ spacing }) => spacing};
		}
`

const Decoration = styled.div`
		background: ${({ side }) => Bg('ButtonGroupDecoration_' + side)} center center / cover no-repeat;
		width: 75px;
		position: absolute;
		${({ side }) => side}: -75px;
		height: 35px;
`

export function ButtonGroup({ children, decorate = true, spacing = '0px' }) {
		return (
				<Wrapper spacing={spacing}>
						{decorate && <Decoration side='left' />}
						{children}
						{decorate && <Decoration side='right' />}
				</Wrapper>
		)
}