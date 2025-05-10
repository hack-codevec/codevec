"use client"

import { useState, useRef, useCallback } from "react"
import { Loader2, WifiOff, Wifi, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface StatusViewerProps {
  project_id: string
  wsUrl: string
}

export function StatusViewer({ project_id, wsUrl }: StatusViewerProps) {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "disconnected">("idle")
  const [messages, setMessages] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  const navigateToProject = useCallback(() => {
    window.location.href = `/projects/${project_id}`
  }, [project_id])

  const connectWebSocket = () => {
    if (isCompleted) return

    if (socketRef.current) {
      socketRef.current.close()
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    setConnectionStatus("connecting")
    setError(null)

    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      setConnectionStatus("connected")
      setError(null)
      console.log("WebSocket connected")
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("Received WebSocket message:", data)

        setMessages((prev) => [...prev, data.message || data])

        const status = data.status
        const success =
          status === true || status === "complete" || status === "success"

        if (success && !isCompleted) {
          setIsCompleted(true)
          socket.close(1000, "Initialization complete")
          setTimeout(() => {
            navigateToProject()
          }, 500)
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err)
        setMessages((prev) => [...prev, { raw: event.data }])
      }
    }

    socket.onerror = (err) => {
      console.error("WebSocket error:", err)
      setError("Connection error occurred")
    }

    socket.onclose = (event) => {
      setConnectionStatus("disconnected")
      if (!isCompleted && !event.wasClean) {
        setError(`Connection closed unexpectedly (code: ${event.code})`)
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket()
        }, 3000)
      }
    }

    socketRef.current = socket
  }

  const handleManualNavigate = () => {
    navigateToProject()
  }

  return (
    <div className="w-[90%] md:w-[50%]  border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center">
          {connectionStatus === "connecting" ? (
            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin mr-2" />
          ) : connectionStatus === "connected" ? (
            <Wifi className="h-5 w-5 text-green-500 mr-2" />
          ) : connectionStatus === "disconnected" ? (
            <WifiOff className="h-5 w-5 text-red-500 mr-2" />
          ) : null}
          <span className="font-medium capitalize">
            {connectionStatus === "idle" ? "Not started" : connectionStatus}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={connectWebSocket}
            className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-md hover:bg-accent/90 transition-colors"
            disabled={connectionStatus === "connected" || isCompleted}
          >
            Start Initialization
          </button>

          <button
            onClick={handleManualNavigate}
            className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-md hover:bg-secondary/90 transition-colors"
          >
            Go to Project
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 p-3 border-b border-border">
          <div className="flex items-center text-red-500">
            <AlertCircle size={16} className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-medium mb-3">WebSocket Data</h3>

        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>
              {connectionStatus === "connected"
                ? "Connected. Waiting for data..."
                : connectionStatus === "connecting"
                ? "Connecting to server..."
                : "Click 'Start Initialization' to begin"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className="bg-secondary/50 rounded-md p-3">
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {JSON.stringify(message, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
