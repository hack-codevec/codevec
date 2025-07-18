"use client"

import { useEffect, useState } from "react"
import AuthPage from "@/components/auth/auth-form"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { AuthLoadingScreen } from "@/components/loading-screen"

function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {

      switch (event) {
        case "INITIAL_SESSION":
        
          if (session?.user && session.access_token) {
            setIsAuthenticated(true)
            setIsLoading(true)
            setTimeout(() => {
              router.push("/projects")
            }, 1000)
          } else {
            setIsAuthenticated(false)
            setIsLoading(false)
          }
          break

        case "SIGNED_IN":
          setIsAuthenticated(true)
          setIsLoading(true)
          setTimeout(() => {
            router.push("/projects")
          }, 1500)
          break

        case "SIGNED_OUT":
          setIsAuthenticated(false)
          setIsLoading(false)
          break

        case "TOKEN_REFRESHED":
          if (session?.user && session.access_token) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
            setIsLoading(false)
          }
          break

        default:
          console.log("Unhandled auth event:", event)
          if (session?.user && session.access_token) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
            setIsLoading(false)
          }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (isLoading || isAuthenticated) {
    return <AuthLoadingScreen />
  }

  return <AuthPage />
}

export default LoginPage
