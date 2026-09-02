import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SignInScreen } from '@/features/auth/screens/SignInScreen'
import '@/styles/base.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignInScreen />
  </StrictMode>,
)
