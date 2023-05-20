import { v4 as createGuid } from 'uuid'
import _ from 'lodash'

const { buildMain } = require('./MainBuilder')
const { buildMenu } = require('./MenuBuilder')

let localizationRegistry
let modMenuStructure
let languages
let modBlueprint

function createLocalization(localization = {}, folderPath, characters = [], modData) {
		const localizationPath = folderPath ? `${folderPath}/Localization.json` : 'Localization.json'
		const content = JSON.stringify(_.transform(['', ...characters], (result, key) => {
				_.forEach(['Title', 'Description'], type => {
						const Key = key ? `${key}.${type}` : type
						result.push({
								Key,
								processTemplates: false,
								..._.transform(languages, (result, language) => { result[language] = `${key} ${type}`.trim() }, {}),
								...localization[Key] || {}
						})
				})
		}, []), null, 2)

		localizationRegistry.push(localizationPath)
		modData.Localization_json = content
}

function build(obj, nameSpace, characters = [], modMenuGroup, modData) {
		const { name, key, type = nameSpace ? 'Module' : 'Mod', localization, children, menuComponents } = obj
		const guid = obj.guid = obj.guid || createGuid()
		const folderName = key || type || name || guid

		let data

		if (folderName === modBlueprint.key) {
				data = modData
		} else {
				data = modData[folderName] = modData[folderName] || {}
		}

		if (nameSpace) nameSpace += '.'
		nameSpace += folderName
		const folderPath = nameSpace.split('.').splice(1).join('/')

		const menuEntry = {}
		let params
		let buildFunc

		let className
		switch (type) {
				case 'Mod':
						className = 'Main'
						buildFunc = buildMain
						params = { nameSpace, className }
						if (menuComponents) menuEntry.menuComponents = menuComponents
						break
				case 'Module':
						className = `${key || name}Configurator`
						menuEntry.menuComponents = menuComponents || [{
								type: 'moduleToggle',
								key: nameSpace
						}]
						break
				default:
						className = _.chain([name, key, type, guid]).compact().take(2).join('')
						menuEntry.menuComponents = menuComponents || [{
								type: 'subModuleToggle',
								key: nameSpace
						}]
						break
		}

		if (children) menuEntry.children = {}

		if (characters?.length) {
				_.forEach(characters, character => {
						const characterEntry = { menuComponents: [], ...menuEntry }
						characterEntry.menuComponents = characterEntry.menuComponents.map(({ key, type }) => ({
								type,
								key: `${key}.${character}`
						}))
						if (modMenuGroup[character]) {
								modMenuGroup[character].children[folderName] = { ...characterEntry }
						} else {
								modMenuGroup[character] = {
										menuComponents: [{ type: 'subHeader', key: `${nameSpace.split('.').slice(0, -1).join('.')}.${character}` }],
										children: {
												[folderName]: { ...characterEntry }
										}
								}
						}
				})
		} else modMenuGroup[folderName] = menuEntry

		if (_.isArray(children)) _.forEach(children, child => build(child, nameSpace, obj.characters, menuEntry?.children, data))

		if (buildFunc) {
				data[className + '_cs'] = buildFunc(params)
		}

		createLocalization(localization, folderPath, obj.characters || characters, data)
}

export function buildMod(modBp) {
		if (!modBp) return

		modBlueprint = modBp
		localizationRegistry = []
		modMenuStructure = {}
		languages = _.uniq([...(modBp.languages || []), 'enGB'])

		const modData = {}

		build(modBp, '', [], modMenuStructure, modData)
		return {
				...modData,
				Utils: {
						MenuConfigurator_cs: buildMenu(modBp.key, modMenuStructure)
				},
				LocalizationRegistry_json: JSON.stringify(localizationRegistry, null, 2),
				ModBlueprint_json: JSON.stringify(modBp, null, 2)
		}
}