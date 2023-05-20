import _ from 'lodash'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Button } from '../UI'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'

const { buildMod } = require('../../modFactory/ModBuilder')

const zipMod = (obj, zip) => {
		_.forEach(obj, (val, key) => {
				switch (typeof val) {
						case 'string':
								zip.file(key.replace('_', '.'), val)
								break
						case 'object':
								zipMod(val, zip.folder(key))
								break
						default: break
				}
		})
}

const downloadProject = modScheme => {
		const modObj = buildMod(modScheme)

		if (!modObj) return

		const zip = JSZip()

		zipMod(modObj, zip)
		zip.generateAsync({ type: 'blob' }).then(blob => saveAs(blob, `${modScheme.key}.zip`))
}

export function ProjectDownloader(props) {
		const { modScheme } = useModSchemeContext()

		return (
				<Button
						{...props}
						btn='DownloadProject'
						onClick={() => downloadProject(modScheme)} />
		)
}