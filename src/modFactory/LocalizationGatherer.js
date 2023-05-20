const fs = require('fs')
const { parse } = require('comment-json')
const _ = require('lodash')
const { log } = console

module.exports = {
		gatherLocalizations: (rootPath, modName) => {
				const modLocalization = []
				const registryPath = `${rootPath}/LocalizationRegistry.json`

				if (fs.existsSync(registryPath)) {
						log('Gathering localization...')
						parse(fs.readFileSync(registryPath).toString()).forEach(localizationPath => {
								const nameSpace = localizationPath.split('/').slice(0, -1)
								const localization = parse(fs.readFileSync(localizationPath).toString()).map(entry => {
										entry.Key = _.chain([modName, ...nameSpace, entry.Key]).compact().join('.').value()
										return entry
								})
								log(nameSpace)
								log(localization)
								modLocalization.push(...localization)
								fs.unlinkSync(localizationPath)
						})

						fs.unlinkSync(registryPath)
						fs.writeFileSync(`${rootPath}/Localization.json`, JSON.stringify(modLocalization, null, 2))
						log('Localization gathered!')
				}
		}
}

//<Target Name = "PreBuild" BeforeTargets = "PreBuildEvent">
//		<Exec Command="Powershell.exe node -e 'require(`./ModFactory/LocalizationGatherer.js`).gatherLocalizations(`.`, `$(AssemblyName)`)'" />
//</Target >
//
//<ItemGroup>
//		<None Remove=".\Localization.json" />
//</ItemGroup>
//
//<ItemGroup>
//		<EmbeddedResource Include=".\Localization.json" />
//</ItemGroup>