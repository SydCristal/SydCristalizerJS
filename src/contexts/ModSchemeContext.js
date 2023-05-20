import { createContext, useContext, useState } from 'react'

const ModSchemeContext = createContext(null)

const ModSchemeProvider = ({ children }) => {
		const [modScheme, setModScheme] = useState(JSON.parse(localStorage.getItem('modScheme')))

		const value = {
				modScheme,
				setModScheme: modScheme => {
						localStorage.setItem('modScheme', JSON.stringify(modScheme))
						setModScheme(modScheme)
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