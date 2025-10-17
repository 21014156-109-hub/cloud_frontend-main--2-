import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getAuthUserData } from './utils/helper';

// Hydrate runtime auth state from localStorage before rendering so
// components and guards read consistent auth/user data on page refresh.
try {
  getAuthUserData();
} catch {
  // ignore any errors during hydration
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
