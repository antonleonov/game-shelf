'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'

declare global {
  interface Window {
    google: any
  }
}

export default function Login() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // Load Google Sign-In script
      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.body.appendChild(script)

        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            // Decode the credential (JWT)
            const base64Url = response.credential.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )
            const payload = JSON.parse(jsonPayload)

            await login(
              payload.sub,
              payload.email,
              payload.name,
              payload.picture
            )
          } catch (error) {
            console.error('Login error:', error)
            alert('Login failed. Please try again.')
          } finally {
            setLoading(false)
          }
        },
      })

      // Prompt sign-in
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render button
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button')!,
            { theme: 'outline', size: 'large' }
          )
        }
      })
    } catch (error) {
      console.error('Google Sign-In error:', error)
      alert('Failed to initialize Google Sign-In. Please check your configuration.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '10px', color: '#333' }}>Game Shelf</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          Organize your game library and connect with gamers
        </p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Loading...' : 'Sign in with Google'}
        </button>
        <div id="google-signin-button" style={{ marginTop: '20px' }}></div>
      </div>
    </div>
  )
}

