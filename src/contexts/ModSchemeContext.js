import { createContext, useContext, useState } from 'react'
import { sortGroup, CONTENT_GROUPS } from '../Utils/'

const ModSchemeContext = createContext(null)

const ModSchemeProvider = ({ children }) => {
		const [modScheme, setModScheme] = useState(JSON.parse(localStorage.getItem('modScheme')))

		const value = {
				modScheme,
				setModScheme: newModScheme => {
						const indexCounter = {
								mod: 0,
								menu: 0
						}

						const updateStructure = ({ key, ...item }) => {
								const { path = key, nameSpace = key, ...rest } = item
								const result = {
										...rest, key, path, nameSpace,
										index: indexCounter[nameSpace.split('.')[0]]++
								}

								CONTENT_GROUPS.forEach(groupName => {
										if (item[groupName]?.length) {
												const childGroupPath = `${path}.${groupName}`
												result[groupName] = item[groupName].sort((a, b) => sortGroup(groupName, a, b)).map((child, i) => {
														return updateStructure({
																...child,
																nameSpace: `${nameSpace}.${child.key}`,
																path: `${childGroupPath}[${i}]`
														})
												})
										}
								})

								return result
						}

						let result = null

						if (newModScheme) {
								const { menu, mod, ...restProps } = newModScheme
								const updatedMod = updateStructure(mod)
								const updatedMenu = updateStructure(menu)

								result = {
										...restProps,
										mod: updatedMod,
										menu: updatedMenu
								}
						}

						localStorage.setItem('modScheme', JSON.stringify(result))
						setModScheme(result)
						return result
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