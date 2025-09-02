import React from 'react'
import './App.css'
import Pages from './pages'
import { Toaster } from 'sonner'
import AuthGuard from './components/auth/AuthGuard'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { DealerProvider } from './contexts/DealerContext'
import { DealerActivationProvider } from './contexts/DealerActivationContext'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthGuard>
          <DealerProvider>
            <DealerActivationProvider>
              <Pages />
            </DealerActivationProvider>
          </DealerProvider>
        </AuthGuard>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App 