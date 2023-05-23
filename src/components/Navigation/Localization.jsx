import LocalizedStrings from 'react-localization'

export const l = new LocalizedStrings({
		enGB: {
				navigation: 'Navigation',
				displayNames: 'Display names',
				displayKeys: 'Display ID',
				recursionIsNotAllowed: 'Element can`t be dropped inside it`s descendant',
				targetContainsKey: 'Target already contains a child with the same ID'
		},
		ruRU: {
				navigation: 'Навигация',
				displayNames: 'Отображать названия',
				displayKeys: 'Отображать ID',
				recursionIsNotAllowed: 'Элемент не может быть помещён внутрь своего потомка',
				targetContainsKey: 'Цель уже содержит элемент с таким ID'
		}
})