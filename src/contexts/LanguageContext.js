import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

const LanguageProvider = ({ children }) => {
		const [language, setLanguage] = useState(localStorage.getItem('language') || 'enGB')

		const value = {
				language,
				setLanguage: language => {
						localStorage.setItem('language', language)
						setLanguage(language)
				}
		}

		return (
				<LanguageContext.Provider value={value}>
						{children}
				</LanguageContext.Provider>
		)
}

const useLanguageContext = () => {
		const context = useContext(LanguageContext)

		return context
}

export { LanguageContext, LanguageProvider, useLanguageContext }