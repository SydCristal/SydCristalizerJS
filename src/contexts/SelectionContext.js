import { createContext, useContext, useState } from 'react'

const SelectionContext = createContext(null)

const SelectionProvider = ({ children }) => {
		const [selection, setSelection] = useState(JSON.parse(localStorage.getItem('selection')) || [])

		const value = {
				selection,
				setSelection: selection => {
						localStorage.setItem('selection', JSON.stringify(selection))
						setSelection(selection)
				}
		}

		return (
				<SelectionContext.Provider value={value}>
						{children}
				</SelectionContext.Provider>
		)
}

const useSelectionContext = () => {
		const context = useContext(SelectionContext)

		return context
}

export { SelectionContext, SelectionProvider, useSelectionContext }