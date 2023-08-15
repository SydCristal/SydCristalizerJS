const origin = `${window.location.origin}`

const getAsset = (folder, fileName, urlize = true) => {
		let result = `${origin}/${folder}/${fileName}.png`
		if (urlize) result = `url(${result})`
		return result
}

export function Bg(fileName, urlize) {
		return getAsset('backgrounds', fileName, urlize)
}

export function Btn(fileName, urlize) {
		return getAsset('buttons', fileName, urlize)
}

export function Icn(fileName, urlize) {
		return getAsset('icons', fileName, urlize)
}

export function Crs(fileName, urlize) {
		return getAsset('cursors', fileName, urlize)
}

export function getPathFromNameSpace(modScheme, nameSpace) {
		const keyArray = nameSpace.split('.')
		let objectToSearch = modScheme
		let result

		keyArray.forEach((key, i) => {
				if (i === 0) {
						objectToSearch = objectToSearch[key]
						result = key
						return
				}

				let groupsToSearch = ['subHeaders', 'modules']
				if (i === keyArray.length - 1) groupsToSearch = [...groupsToSearch, 'controls', 'configurators']

				groupsToSearch.some((groupName) => {
						const groupContent = objectToSearch[groupName]
						if (!groupContent || !groupContent.length) return

						const target = groupContent.find((item, j) => {
								if (item.key === key) {
										result += `.${groupName}[${j}]`
										return true
								}
						})

						if (!target) return

						objectToSearch = target

						return true
				}) 
		})

		return result
}

export function getIndexFromPath(path) {
		const pathArray = path?.split('.')
		if (!pathArray || pathArray.length < 2) return 0
		return +pathArray[pathArray.length - 1]?.split('[')?.[1]?.slice(0, -1)
}

export function getGroupPath(path) {
		const indexLength = getIndexFromPath(path)?.toString()?.length || 0
		const pathArray = path.split('.')
		const group = pathArray.pop().slice(0, -(indexLength + 2))
		return [...pathArray, group].join('.')
}

export function sortGroup(groupName, a, b) {
		if (['controls', 'subHeaders'].includes(groupName)) return 0

		let result = (b.modules?.length || 0) - (a.modules?.length || 0)

		if (result === 0) result = (b.configurators?.length || 0) - (a.configurators?.length || 0)

		if (result === 0) result = a.key > b.key ? 1 : -1

		return result
}