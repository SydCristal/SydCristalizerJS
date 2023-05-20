import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './contexts/LanguageContext'
import { ModSchemeProvider } from './contexts/ModSchemeContext'
import { SelectionProvider } from './contexts/SelectionContext'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ModSchemeProvider>
        <SelectionProvider>
          <App />
        </SelectionProvider>
      </ModSchemeProvider>
    </LanguageProvider>
  </React.StrictMode>
)
