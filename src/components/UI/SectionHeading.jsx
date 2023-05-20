import styled from 'styled-components'
import { Bg } from '../../Utils'

const Heading = styled.h2`
		color: maroon;
		width: 300px;
		text-align: center;
		font-size: 30px;
		min-height: 33px;
		margin: 0px auto 25px;
		position: relative;
		&::after {
				content: '';
				background: ${Bg('SectionHeading')} center bottom / cover no-repeat;
				position: absolute;
				z-index: 1;
				height: 25px;
				width: 200px;
				bottom: -20px;
				left: calc(50% - 100px);
		};
`

export function SectionHeading({ children }) {
		return (
				<Heading>
						{children}
				</Heading>
		)
}