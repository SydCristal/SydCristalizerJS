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