import LocalizedStrings from 'react-localization'

export const l = new LocalizedStrings({
		enGB: {
				selectNewItemType: 'Select a type for the new item',
				enterNewItemKey: 'Enter an ID for the new item',
				module: 'Module',
				subModule: 'Submodule',
				item: 'Configurator',
				subHeader: 'Subheader',
				switch: 'Switch',
				new: 'New',
				cancel: 'Cancel',
				confirm: 'Confirm',
				keyIsUnvailable: 'Parent element already contains an item with this ID'
		},
		ruRU: {
				selectNewItemType: 'Выберите тип нового элемента',
				enterNewItemKey: 'Введите ID нового элемента',
				module: 'Модуль',
				subModule: 'Подмодуль',
				item: 'Конфигуратор',
				subHeader: 'Подзаголовок',
				switch: 'Переключатель',
				new: 'Новый',
				cancel: 'Отмена',
				confirm: 'Подтвердить',
				keyIsUnvailable: 'Родительский элемент уже содержит потомка с этим ID'
		}
})