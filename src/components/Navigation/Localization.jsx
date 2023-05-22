import LocalizedStrings from 'react-localization'

export const l = new LocalizedStrings({
		enGB: {
				navigation: 'Navigation',
				displayNames: 'Display names',
				displayKeys: 'Display ID',
				targetHasNoStructure: 'Target can`t contain elemets',
				recursionIsNotAllowed: 'Element can`t be dropped inside it`s descendant',
				targetContainsKey: 'Target already contains a child with the same ID'
		},
		ruRU: {
				navigation: 'Навигация',
				displayNames: 'Отображать названия',
				displayKeys: 'Отображать ID',
				targetHasNoStructure: 'Цель не может содержать элементы',
				recursionIsNotAllowed: 'Элемент не может быть помещён в собственный внутренный элемент',
				targetContainsKey: 'Цель уже содержит элемент с таким ID'
		}
})