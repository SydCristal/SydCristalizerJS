import { createContext, useContext, useState } from 'react'

const ModSchemeContext = createContext(null)

const ModSchemeProvider = ({ children }) => {
		const [modScheme, setModScheme] = useState(JSON.parse(localStorage.getItem('modScheme')))

		const value = {
				modScheme,
				setModScheme: newModScheme => {
						let structureIndex = 0
						let menuIndex = 0

						const setIndexes = (isMod, item) => {
								const { controls, subSections, modules, configurators, ...rest } = item
								const result = {
										...rest,
										index: isMod ? structureIndex : menuIndex
								}

								if (isMod) {
										structureIndex += 1
								} else {
										menuIndex += 1
								}

								['controls', 'subSections', 'modules', 'configurators'].forEach(groupName => {
										if (item[groupName]?.length) {
												result[groupName] = item[groupName].map(item => setIndexes(isMod, item))
										}
								})

								return result
						}

						let result = null

						if (newModScheme) {
								const { menu, mod, ...restProps } = newModScheme
								const indexedMod = setIndexes(true, mod)
								const indexedMenu = setIndexes(false, menu)

								result = {
										...restProps,
										mod: indexedMod,
										menu: indexedMenu
								}
						}

						localStorage.setItem('modScheme', JSON.stringify(result))
						setModScheme(result)
				}
		}

		return (
				<ModSchemeContext.Provider value={value}>
						{children}
				</ModSchemeContext.Provider>
		)
}

const useModSchemeContext = () => {
		const context = useContext(ModSchemeContext)

		return context
}

export { ModSchemeContext, ModSchemeProvider, useModSchemeContext }