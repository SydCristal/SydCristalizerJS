import LocalizedStrings from 'react-localization'

export const l = new LocalizedStrings({
		enGB: {
				editor: 'Editor',
				emptyKeyError: 'ID is required',
				unavailableKeyError: 'ID is already taken'
		},
		ruRU: {
				editor: 'Редактор',
				emptyKeyError: 'Необходимо ввести ID',
				unavailableKeyError: 'Этот ID уже занят'
		}
})