import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <UserProvider>
          <NotificationProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <App />
          </NotificationProvider>
        </UserProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
