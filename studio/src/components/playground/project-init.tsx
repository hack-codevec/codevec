"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Loader2, WifiOff, Wifi, AlertCircle, CheckCircle, Play, ExternalLink, Database, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface StatusViewerProps {
  project_id: string
  wsUrl: string
  onStatusUpdate?: (status: boolean) => void | boolean
  onInitializationComplete?: () => void
}

type WSMessage =
  | {
      message?: unknown
      status?: boolean | string
    }
  | {
      raw: string
    }

// Enhanced loading animation component
function InitializationLoader() {
  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-accent/20 rounded-full animate-spin">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-accent rounded-full transform -translate-x-1/2 -translate-y-1"></div>
        </div>
        <div className="absolute inset-0 w-16 h-16 border border-accent/30 rounded-full animate-pulse"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">Initializing Project</h3>
        <p className="text-sm text-muted-foreground">Setting up your development environment...</p>
      </div>
    </div>
  )
}

// Connection status indicator
function ConnectionStatus({ status }: { status: "idle" | "connecting" | "connected" | "completed" | "error" }) {
  const getStatusConfig = () => {
    switch (status) {
      case "connecting":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: "Connecting",
          color: "text-yellow-600",
          bg: "bg-yellow-500/10 border-yellow-500/20",
        }
      case "connected":
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: "Connected",
          color: "text-accent",
          bg: "bg-accent/10 border-accent/20",
        }
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Complete",
          color: "text-accent",
          bg: "bg-accent/10 border-accent/20",
        }
      case "error":
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: "Error",
          color: "text-red-600",
          bg: "bg-red-500/10 border-red-500/20",
        }
      default:
        return {
          icon: <Database className="h-4 w-4" />,
          text: "Ready",
          color: "text-muted-foreground",
          bg: "bg-muted/10 border-border",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${config.color} ${config.bg}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  )
}

// Message display component
function MessageDisplay({ messages }: { messages: WSMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
          <Database className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Waiting for initialization data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className="glass-morphism border-border/20 rounded-lg p-4 animate-slide-in-left"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
            <pre className="text-sm text-card-foreground whitespace-pre-wrap break-words font-mono leading-relaxed flex-1">
              {JSON.stringify(message, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatusViewer({ project_id, wsUrl, onStatusUpdate, onInitializationComplete }: StatusViewerProps) {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "completed" | "error">(
    "idle",
  )
  const [messages, setMessages] = useState<WSMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [isBackendComplete, setIsBackendComplete] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializingRef = useRef(false)

  // Initialization steps for better UX
  const initSteps = [
    "Connecting to server...",
    "Setting up environment...",
    "Installing dependencies...",
    "Configuring project...",
    "Building application...",
    "Finalizing setup...",
    "Almost ready...",
    "Completing initialization...",
  ]

  const navigateToProject = useCallback(() => {
    console.log("🔄 Manual navigation to project requested")
    window.location.href = `/projects/${project_id}`
  }, [project_id])

  // Enhanced progress simulation with steps
  useEffect(() => {
    if (connectionStatus === "connected" && !isCompleted && isInitializingRef.current) {
      let stepIndex = 0
      let currentProgress = 0

      const updateProgress = () => {
        if (isBackendComplete) {
          // If backend is complete, speed up to 100%
          setProgress(100)
          setCurrentStep("Initialization complete!")

          setTimeout(() => {
            setIsCompleted(true)
            setConnectionStatus("completed")
          }, 1000)

          return
        }

        // Slower, more realistic progress
        const increment = Math.random() * 3 + 1 // 1-4% increments
        currentProgress = Math.min(currentProgress + increment, 85) // Cap at 85% until backend completes

        setProgress(currentProgress)

        // Update step message
        const newStepIndex = Math.floor((currentProgress / 85) * (initSteps.length - 1))
        if (newStepIndex !== stepIndex && newStepIndex < initSteps.length) {
          stepIndex = newStepIndex
          setCurrentStep(initSteps[stepIndex])
        }
      }

      // Update progress every 800ms for smoother animation
      progressIntervalRef.current = setInterval(updateProgress, 800)

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      }
    }
  }, [connectionStatus, isCompleted, isBackendComplete])

  const connectWebSocket = () => {
    if (isCompleted) return

    // Prevent multiple simultaneous connections
    if (isInitializingRef.current) return

    if (socketRef.current) {
      socketRef.current.close()
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    isInitializingRef.current = true
    setConnectionStatus("connecting")
    setError(null)
    setProgress(0)
    setCurrentStep("Initializing connection...")
    setIsBackendComplete(false)

    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      setConnectionStatus("connected")
      setError(null)
      setCurrentStep("Connected! Starting initialization...")
      console.log("WebSocket connected")
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("Received WebSocket message:", data)

        setMessages((prev) => [...prev, data.message || data])

        const status = data.status
        const success = status === true || status === "complete" || status === "success"

        if (success && !isBackendComplete) {
          console.log("🎉 Backend initialization completed!")
          setIsBackendComplete(true)
          setCurrentStep("Finalizing setup...")

          // Give time for progress bar to reach 100%
          setTimeout(() => {
            setProgress(100)
            setCurrentStep("Initialization complete!")

            // Wait a bit more before marking as completed
            setTimeout(() => {
              setIsCompleted(true)
              setConnectionStatus("completed")

              // Call the status update callback
              const shouldPreventNavigation = onStatusUpdate?.(true)

              // Close socket cleanly
              if (socketRef.current) {
                socketRef.current.close(1000, "Initialization complete")
              }

              // Wait for completion animations before notifying parent
              setTimeout(() => {
                console.log("🎮 All animations complete - notifying parent")
                onInitializationComplete?.() // Notify parent that everything is done
              }, 1500) // Wait for success state animation

              // Only navigate if the parent component doesn't prevent it AND no completion handler
              if (shouldPreventNavigation !== false && !onInitializationComplete) {
                console.log("🔄 Auto-navigating to project (not prevented)")
                setTimeout(() => {
                  navigateToProject()
                }, 2000)
              } else {
                console.log("🚫 Auto-navigation prevented or handled by parent component")
              }
            }, 1500) // Extra delay before completion
          }, 1000) // Delay before setting progress to 100%
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err)
        setMessages((prev) => [...prev, { raw: event.data }])
      }
    }

    socket.onerror = (err) => {
      console.error("WebSocket error:", err)
      if (!isCompleted) {
        setError("Connection error occurred")
        setConnectionStatus("error")
        setCurrentStep("Connection failed")
      }
    }

    socket.onclose = (event) => {
      console.log("WebSocket closed:", { code: event.code, reason: event.reason, wasClean: event.wasClean })

      // Don't show disconnect state if initialization is completed or completing
      if (isCompleted || isBackendComplete) {
        console.log("Socket closed after completion - this is expected")
        return
      }

      // Only show error and attempt reconnect if it was an unexpected closure
      if (!event.wasClean && event.code !== 1000) {
        setConnectionStatus("error")
        setError(`Connection lost (code: ${event.code})`)
        setCurrentStep("Connection lost - retrying...")

        // Only reconnect if we haven't completed initialization
        if (!isCompleted && !isBackendComplete) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...")
            connectWebSocket()
          }, 3000)
        }
      }
    }

    socketRef.current = socket
  }

  useEffect(() => {
    // Cleanup function
    return () => {
      isInitializingRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  // Start initialization when component mounts
  useEffect(() => {
    // Start initialization immediately when this component is shown
    const timer = setTimeout(() => {
      connectWebSocket()
    }, 500) // Small delay to prevent immediate connection issues

    return () => clearTimeout(timer)
  }, [])

  const handleManualNavigate = () => {
    navigateToProject()
  }

  const handleRestart = () => {
    // Reset all states
    setIsCompleted(false)
    setIsBackendComplete(false)
    setProgress(0)
    setCurrentStep("")
    setError(null)
    setMessages([])
    isInitializingRef.current = false

    // Start fresh connection
    setTimeout(() => {
      connectWebSocket()
    }, 100)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Card className="glass-morphism border-border/20 shadow-2xl shadow-black/5 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="border-b border-border/20 p-6 bg-card/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">Project Initialization</h2>
                  <p className="text-sm text-muted-foreground">Setting up your development environment</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ConnectionStatus status={connectionStatus} />
              <div className="flex gap-2">
                <Button
                  onClick={handleRestart}
                  disabled={connectionStatus === "connecting" || isCompleted}
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {connectionStatus === "idle" ? "Start" : "Restart"}
                </Button>
                <Button
                  onClick={handleManualNavigate}
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent/5 hover:border-accent/30 hover:text-accent bg-transparent"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Go to Project
                </Button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {(connectionStatus === "connected" || connectionStatus === "completed") && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-mono text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
              {/* Current step indicator */}
              {currentStep && <div className="mt-2 text-xs text-muted-foreground animate-pulse">{currentStep}</div>}
            </div>
          )}
        </div>

        {/* Error display */}
        {error && connectionStatus === "error" && (
          <div className="bg-red-500/5 border-b border-red-500/20 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-600">Connection Error</p>
                <p className="text-xs text-red-600/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success state */}
        {isCompleted && (
          <div className="bg-accent/5 border-b border-accent/20 p-4 animate-slide-in-left">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-accent">Initialization Complete!</p>
                <p className="text-xs text-accent/80">Your project is ready to use.</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {connectionStatus === "connecting" && messages.length === 0 ? (
            <InitializationLoader />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-card-foreground">Initialization Log</h3>
                <div className="text-xs text-muted-foreground">
                  {messages.length} {messages.length === 1 ? "message" : "messages"}
                </div>
              </div>
              <MessageDisplay messages={messages} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
