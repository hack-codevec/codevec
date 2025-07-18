"use client"

import { useState,  } from "react"
import { Github, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CodeDisplay from "@/components/auth/quotes"
import { Notification } from "@/components/notification"
import { login } from "@/utils/login/actions"
import type { Providers } from "@/types/login"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  const handleLogin = async (provider: Providers) => {
    try {
      setIsLoading(true)
      await login(provider)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">

      {/* Hero Gradient Background */}
      <div className="hero-gradient absolute inset-0 z-0" />

      <div className="flex h-full min-h-screen flex-row items-center justify-center relative z-10">
        {/* Left half - Auth form */}
        <div className="flex w-full items-center justify-center p-4 md:w-1/2">
          <Card className="w-full max-w-md glass-morphism border-border shadow-2xl shadow-black/10 p-8 animate-scale-in interactive-card">
            <div className="mb-8 text-center">
              <div className="flex flex-row items-center justify-center mb-4">
                <h1 className="text-4xl font-bold ">Code</h1>
                <h1 className="text-4xl font-bold text-accent/80">Vec</h1>
              </div>
              <p className="text-muted-foreground text-lg">Sign in to continue to the platform</p>
              <div className="w-20 h-1 bg-gradient-to-r from-accent to-primary mx-auto mt-4 rounded-full" />
            </div>

            <div className="space-y-6">
              <Button
                variant="outline"
                className="w-full h-12 bg-card border-2 border-border/30 text-card-foreground hover:bg-accent/5 hover:border-accent/30 hover:text-foreground hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 group relative overflow-hidden font-medium"
                disabled={isLoading}
                onClick={() => handleLogin("google")}
                >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Mail className="mr-3 h-5 w-5 text-accent relative z-10" />
                <span className="relative z-10">Continue with Google</span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-card border-2 border-border/30 text-card-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group relative overflow-hidden font-medium"
                disabled={isLoading}
                onClick={() => handleLogin("github")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Github className="mr-3 h-5 w-5 text-primary relative z-10" />
                <span className="relative z-10">Continue with GitHub</span>
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="text-accent hover:text-accent/80 transition-colors underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-accent hover:text-accent/80 transition-colors underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </Card>
        </div>

        {/* Right half - Code display */}
        <div className="hidden md:flex md:justify-start md:w-1/2 animate-slide-in-right">
          <div className="flex w-full max-w-2xl items-center justify-start p-8">
            <div className="w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-2">Welcome to the Future of Development</h2>
                <p className="text-muted-foreground">Join thousands of developers building amazing things</p>
              </div>
              <CodeDisplay />
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  )
}
