import { createContext, useContext, useState } from 'react'

const CreationContext = createContext(null)

const CreationProvider = ({ children }) => {
		const [creation, setCreation] = useState(JSON.parse(localStorage.getItem('creation')) || null)

		const value = {
				creation,
				setCreation: creation => {
						localStorage.setItem('creation', JSON.stringify(creation))
						setCreation(creation)
				}
		}

		return (
				<CreationContext.Provider value={value}>
						{children}
				</CreationContext.Provider>
		)
}

const useCreationContext = () => {
		const context = useContext(CreationContext)

		return context
}

export { CreationContext, CreationProvider, useCreationContext }