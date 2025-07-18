"use client"

import { useEffect, useState } from "react"
import { Sparkles, Code, Zap } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  showProgress?: boolean
  duration?: number
}

export function LoadingScreen({ 
  message = "Loading your workspace...", 
  showProgress = true,
  duration = 3000 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(message)
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; left: number }>>([])

  const loadingMessages = [
    "Initializing workspace...",
    "Loading your projects...",
    "Setting up environment...",
    "Almost ready...",
    "Welcome to CodeVec!"
  ]

  useEffect(() => {
    // Generate particles
    const particleArray = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      left: Math.random() * 100,
    }))
    setParticles(particleArray)

    if (showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / (duration / 100))
          
          // Update message based on progress
          const messageIndex = Math.floor((newProgress / 100) * (loadingMessages.length - 1))
          setCurrentMessage(loadingMessages[messageIndex] || loadingMessages[loadingMessages.length - 1])
          
          return Math.min(newProgress, 100)
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [duration, showProgress])

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="hero-gradient absolute inset-0" />
      
      {/* Particles */}
      <div className="particles absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle absolute w-1 h-1 bg-accent rounded-full opacity-60"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated Top Bar */}
      <div className="w-full h-1 absolute top-0 left-0 bg-gradient-to-r from-accent via-primary to-accent animate-glow" />

      {/* Main Loading Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md mx-auto px-6">
        
        {/* Logo Animation */}
        <div className="mb-8 relative">
          {/* Brand Name */}
          <div className="flex items-center justify-center space-x-1">
            <h1 className="text-3xl font-bold gradient-text animate-scale-in">Code</h1>
            <h1 className="text-3xl font-bold text-accent/80 animate-scale-in" style={{ animationDelay: "0.2s" }}>Vec</h1>
          </div>
        </div>

        {/* Loading Message */}
        <div className="mb-8 min-h-[2rem] flex items-center justify-center">
          <p className="text-muted-foreground text-lg animate-pulse">
            {currentMessage}
          </p>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full max-w-xs mb-6">
            <div className="relative">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-muted-foreground font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center justify-center space-x-8 mt-12 opacity-60">
          <div className="flex flex-col items-center space-y-2 animate-slide-in-left">
            <Code className="w-6 h-6 text-primary" />
            <span className="text-xs text-muted-foreground">Code</span>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <Zap className="w-6 h-6 text-accent" />
            <span className="text-xs text-muted-foreground">Fast</span>
          </div>
          <div className="flex flex-col items-center space-y-2 animate-slide-in-right" style={{ animationDelay: "0.6s" }}>
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-xs text-muted-foreground">Magic</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized loading screens for different contexts
export function AuthLoadingScreen() {
  return (
    <LoadingScreen 
      message="Authenticating..." 
      showProgress={false}
    />
  )
}

export function ProjectLoadingScreen() {
  return (
    <LoadingScreen 
      message="Loading your projects..." 
      showProgress={true}
      duration={2000}
    />
  )
}

export function AppLoadingScreen() {
  return (
    <LoadingScreen 
      message="Initializing CodeVec..." 
      showProgress={true}
      duration={3000}
    />
  )
}
