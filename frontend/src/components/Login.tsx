'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    google: any
  }
}

export default function Login() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  // Debug: Log Client ID on component mount and expose to window for console debugging
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    
    // Expose to window for browser console debugging
    if (typeof window !== 'undefined') {
      (window as any).__GOOGLE_CLIENT_ID__ = clientId
    }
    
    console.log('🔍 Google Client ID check:', {
      isSet: !!clientId,
      value: clientId ? `${clientId.substring(0, 20)}...` : 'NOT SET',
      fullValue: clientId || 'MISSING',
      note: 'Check in console: window.__GOOGLE_CLIENT_ID__'
    })
    
    if (!clientId || clientId === 'your-google-client-id-here') {
      console.error('❌ Google Client ID is not configured properly!')
      console.error('   Make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set in .env and restart frontend container')
    } else {
      console.log('✅ Google Client ID is configured')
    }
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // Check if Google Client ID is configured
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId || clientId === 'your-google-client-id-here') {
        console.error('Google Client ID not configured')
        alert('Google Client ID is not configured. Please check your .env file.')
        setLoading(false)
        return
      }

      // Load Google Sign-In script
      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = () => {
            reject(new Error('Failed to load Google Sign-In script'))
          }
          document.body.appendChild(script)
        })
      }

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            if (!response || !response.credential) {
              throw new Error('No credential received from Google')
            }

            // Decode the credential (JWT)
            const base64Url = response.credential.split('.')[1]
            if (!base64Url) {
              throw new Error('Invalid credential format')
            }

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )
            const payload = JSON.parse(jsonPayload)

            console.log('Google login payload:', { 
              sub: payload.sub, 
              email: payload.email, 
              name: payload.name 
            })

            if (!payload.sub || !payload.email || !payload.name) {
              throw new Error('Missing required user information from Google')
            }

            await login(
              payload.sub,
              payload.email,
              payload.name,
              payload.picture
            )
          } catch (error: any) {
            console.error('Login error details:', {
              error,
              message: error?.message,
              response: error?.response?.data,
              status: error?.response?.status
            })
            
            const errorMessage = error?.response?.data?.error 
              || error?.message 
              || 'Login failed. Please try again.'
            alert(`Login failed: ${errorMessage}`)
          } finally {
            setLoading(false)
          }
        },
      })

      // Prompt sign-in
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render button
          const buttonContainer = document.getElementById('google-signin-button')
          if (buttonContainer) {
            window.google.accounts.id.renderButton(
              buttonContainer,
              { theme: 'outline', size: 'large' }
            )
          }
        }
      })
    } catch (error: any) {
      console.error('Google Sign-In initialization error:', {
        error,
        message: error?.message,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set' : 'Missing'
      })
      
      const errorMessage = error?.message || 'Failed to initialize Google Sign-In. Please check your configuration.'
      alert(`Error: ${errorMessage}\n\nCheck the browser console and DEBUG_GOOGLE_AUTH.md for troubleshooting steps.`)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Game Shelf</CardTitle>
          <CardDescription>
            Organize your game library and connect with gamers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Loading...' : 'Sign in with Google'}
          </Button>
          <div id="google-signin-button" className="flex justify-center mt-4"></div>
        </CardContent>
      </Card>
    </div>
  )
}
