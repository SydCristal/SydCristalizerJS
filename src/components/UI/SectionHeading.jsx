import styled from 'styled-components'
import { Bg } from '../../Utils'

const StlSectionHeading = styled.div`
		width: 300px;
		min-height: 33px;
		margin: 0px auto 30px;
		position: relative;
		* {
				color: maroon;
				text-align: center;
				font-size: 30px;
				font-weight: bold;
				max-width: 100%;
		};
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
				<StlSectionHeading>
						<div>{children}</div>
				</StlSectionHeading>
		)
}