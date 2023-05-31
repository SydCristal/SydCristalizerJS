import styled from 'styled-components'
import Header from '../Header'
import { Bg } from '../../Utils'
import Navigation from '../Navigation'
import Palette from '../Palette'
import Editor from '../Editor'

const StlLayout = styled.section`
		background: ${Bg('Layout')} center bottom / cover no-repeat;
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	`

const Content = styled.div`
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		padding: 5px 5% 5%;
		> aside {
			flex: 1;
		};
		> * {
			height: 100%;
			&:not(:first-child) {
				padding-left: 5px;
			};
			&:not(:last-child) {
				padding-right: 5px;
			};
		}
`

export default function Layout() {
		return (
				<StlLayout>
						<Header />
						<Content>
								<Navigation />
								<Editor />
								<Palette />
						</Content>
				</StlLayout>
		)
}