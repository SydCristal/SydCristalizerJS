import { createContext, useContext, useState } from 'react'

const EditionContext = createContext(null)

const EditionProvider = ({ children }) => {
		const [edition, setEdition] = useState(JSON.parse(localStorage.getItem('edition')))

		const value = {
				edition,
				setEdition: edition => {
						localStorage.setItem('edition', JSON.stringify(edition))
						setEdition(edition)
				}
		}

		return (
				<EditionContext.Provider value={value}>
						{children}
				</EditionContext.Provider>
		)
}

const useEditionContext = () => {
		const context = useContext(EditionContext)

		return context
}

export { EditionContext, EditionProvider, useEditionContext }