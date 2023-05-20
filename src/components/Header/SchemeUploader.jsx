import styled from 'styled-components'
import { Button } from '../UI'
import { useModSchemeContext } from '../../contexts/ModSchemeContext'

const Input = styled.input`
  display: none;
`

const validateModScheme = modScheme => modScheme

const onLoad = (files, callback) => {
		const reader = new FileReader()
		reader.onload = ({ target: { result } }) => {
				const modScheme = JSON.parse(result)

				if (!validateModScheme(modScheme)) return

				callback(modScheme)
		}
		reader.readAsText(files[0])
}

export function SchemeUploader() {
		const { setModScheme } = useModSchemeContext()

		return (
				<Button btn='UploadScheme' tag='label'>
						<Input type='file' accept='.json' onChange={({ target: { files } }) => onLoad(files, setModScheme)} />
				</Button>
		)
}