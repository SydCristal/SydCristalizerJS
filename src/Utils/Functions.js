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

export function getIndexFromPath(path) {
		const pathArray = path.split('.')
		return pathArray[pathArray.length - 1]?.split('[')?.[1]?.slice(0, -1)
}

export function getGroupPath(path) {
		const indexLength = getIndexFromPath(path)?.toString()?.length || 0
		const pathArray = path.split('.')
		const group = pathArray.pop().slice(0, -(indexLength + 2))
		return [...pathArray, group].join('.')
}