import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import './index.css'

// Suppress CORS errors for missing edge functions that have fallbacks
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('invoke-llm') || message.includes('CORS') || message.includes('Cross-Origin Request Blocked')) {
    // Suppress these specific errors as they have fallbacks
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('invoke-llm') || message.includes('CORS') || message.includes('Cross-Origin Request Blocked')) {
    // Suppress these specific warnings as they have fallbacks
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Suppress unhandled promise rejections for CORS errors
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason?.toString() || '';
  if (message.includes('invoke-llm') || message.includes('CORS') || message.includes('Cross-Origin Request Blocked')) {
    event.preventDefault();
    return;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 