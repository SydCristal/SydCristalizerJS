import { useLanguageContext } from '../../contexts/LanguageContext'
import _ from 'lodash'
import { Button } from '../UI'

const options = ['enGB', 'ruRU']

export function LanguageSwitch({ btn }) {
		const { language, setLanguage } = useLanguageContext()

		const onClick = () => {
				const i = _.findIndex(options, o => o === language)
				const next = options[(i + 1) % options.length]
				localStorage.setItem('language', next)
				setLanguage(next)
		}

		return (
				<Button btn={'TextButton'} onClick={() => onClick()}>
						{language}
				</Button>
		)
}