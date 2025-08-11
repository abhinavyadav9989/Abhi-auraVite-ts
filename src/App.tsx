import React from 'react'
import './App.css'
import Pages from './pages'
import { Toaster } from 'sonner'
import AuthGuard from './components/auth/AuthGuard'
import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <AuthGuard>
        <Pages />
      </AuthGuard>
      <Toaster />
    </Router>
  )
}

export default App 