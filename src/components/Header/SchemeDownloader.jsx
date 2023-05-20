import { saveAs } from 'file-saver'
import { Button } from '../UI'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'

const downloadScheme = modScheme => {
		const modSchemeBlob = new Blob([JSON.stringify(modScheme, null, 2)], {
				type: 'application/json'
		})

		saveAs(modSchemeBlob, `${modScheme.key}.json`)
}

export function SchemeDownloader(props) {
		const { modScheme } = useModSchemeContext()

		return (
				<Button
						{...props}
						btn='DownloadScheme'
						onClick={() => downloadScheme(modScheme)} />
		)
}