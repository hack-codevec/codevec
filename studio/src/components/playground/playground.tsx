"use client"

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { useEffect, useState, useRef } from "react"
import FileViewer from "@/components/file-viewer/file-viewer"
import ChatInput from "@/components/prompt/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Loader2, AlertCircle, Database, Rocket, Play } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { StatusViewer } from "./project-init"
import { useAuth } from "@/hooks/auth-context"
import MarkdownMessage from "./markdown-message"
import apiClient from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectLoadingScreen } from "@/components/loading-screen"

interface PlaygroundProps {
  project_id: string
}

interface Project {
  id: string
  status: boolean
}

function DeployPrompt({ onDeploy }: { onDeploy: () => void }) {
  return (
    <div className="h-full flex flex-col justify-center items-center bg-background px-6">
      <Card className="glass-morphism border-border/20 p-8 text-center max-w-md animate-scale-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
          <Rocket className="w-8 h-8 text-accent" />
        </div>

        <h3 className="text-2xl font-semibold text-card-foreground mb-3">Project Ready to Deploy</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Your project is configured but not yet deployed. Click the button below to start the deployment process and
          activate your development environment.
        </p>

        <Button
          onClick={onDeploy}
          className="bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 group relative overflow-hidden w-full h-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Play className="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative z-10 font-medium">Deploy Project</span>
        </Button>

        <div className="mt-6 pt-6 border-t border-border/20">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>Environment Setup</span>
            </div>
            <div className="flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              <span>Auto Deploy</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ProjectErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="h-full flex flex-col justify-center items-center bg-background px-6">
      <Card className="glass-morphism border-border/20 p-8 text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">Project Not Found</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </Card>
    </div>
  )
}

function ChatMessage({
  isUser,
  content,
  isStreaming,
  userEmail,
}: {
  isUser: boolean
  content: string
  isStreaming?: boolean
  userEmail?: string
}) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${isUser ? "" : "bg-canvas/50"}`}>
      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
        <AvatarFallback className={isUser ? "bg-accent/10 text-accent" : "bg-canvas text-foreground"}>
          {isUser ? userEmail?.charAt(0).toUpperCase() : <Bot size={16} />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="text-sm font-medium mb-2 text-card-foreground">{isUser ? "You" : "Assistant"}</div>
        <div className="text-foreground leading-relaxed overflow-hidden">
          {isUser ? <p>{content}</p> : <MarkdownMessage content={content} isStreaming={isStreaming} />}
        </div>
      </div>
    </div>
  )
}

const Playground = ({ project_id }: PlaygroundProps) => {
  const [projectState, setProjectState] = useState<
    "loading" | "exists" | "ready-to-deploy" | "initializing" | "not-found"
  >("loading")
  const [currentMessage, setCurrentMessage] = useState<string>("")
  const [lastUserQuery, setLastUserQuery] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const initializationCompleteRef = useRef(false)
  const { user } = useAuth()

  const wsBaseUrl = `${process.env.NEXT_PUBLIC_SOCKET_PROTOCOL}://${process.env.NEXT_PUBLIC_BACKEND_SOCKET_URI}/${process.env.NEXT_PUBLIC_SOCKET_PATH}/ws/stream`
  const supabase = createClient()

  const fetchProjectDetails = async () => {
    try {

      const { data, error } = await supabase.from("project").select("*").eq("id", project_id).single()

      if (error) {
        console.error("Database error:", error)
        setProjectState("not-found")
        return
      }

      if (!data) {
        console.log("No project data found")
        setProjectState("not-found")
        return
      }

      const project = data as Project

      if (project.status === true) {
        setProjectState("exists")
      } else {
        setProjectState("ready-to-deploy")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      setProjectState("not-found")
    }
  }

  const handleDeploy = () => {
    setProjectState("initializing")
  }

  const connectWebSocketForStream = async () => {
    if (socketRef.current) {
      socketRef.current.close()
    }

    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    const wsUrl = `${wsBaseUrl}:${encodeURIComponent(project_id)}?token=${token}`

    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log("WebSocket connected for streaming")
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "start") {
          setCurrentMessage("")
          setIsStreaming(true)
        } else if (data.type === "content" && data.content) {
          setCurrentMessage((prev) => prev + data.content)
        } else if (data.type === "end") {
          setIsStreaming(false)
        } else if (data.step === "chunk" && data.data) {
          setCurrentMessage((prev) => prev + data.data)
          setIsStreaming(true)
        } else if (data.step === "complete") {
          setIsStreaming(false)
          socket.close()
          console.log("Socket disconnected")
        } else if (data.content) {
          setCurrentMessage((prev) => prev + data.content)
          setIsStreaming(true)
        }
      } catch (e) {
        console.error("Failed to parse WS message:", e)
      }
    }

    socket.onerror = (err) => {
      console.error("WebSocket error:", err)
      setIsStreaming(false)
    }

    socket.onclose = () => {
      console.warn("WebSocket connection closed")
      setIsStreaming(false)
    }

    socketRef.current = socket
  }

  const handleQuery = async (query: string) => {
    if (!query.trim()) return

    await connectWebSocketForStream()

    const maxWaitTime = 5000
    const interval = 100
    let waited = 0

    while (socketRef.current && socketRef.current.readyState !== WebSocket.OPEN && waited < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, interval))
      waited += interval
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket connection failed to open within timeout.")
      if (socketRef.current) {
        socketRef.current.close()
      }
      setCurrentMessage("Failed to establish a WebSocket connection in time. Please try again.")
      setIsStreaming(false)
      return
    }

    console.log("WebSocket is now open.")
    setLastUserQuery(query)
    setCurrentMessage("")
    setIsStreaming(true)

    try {
      const response = await apiClient.post(`/v1/query`, {
        question: query,
        project_id,
      })

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error sending query:", error)
      setCurrentMessage("Sorry, I couldn't send your query to the server. Please try again.")
      setIsStreaming(false)
    }
  }

  const handleProjectStatusUpdate = (newStatus: boolean) => {
    if (newStatus && !initializationCompleteRef.current) {
      initializationCompleteRef.current = true
      setHasInitialized(true)
      return false
    }
  }

  const handleInitializationComplete = () => {
    setProjectState("exists")
  }

  useEffect(() => {
    initializationCompleteRef.current = false
    setHasInitialized(false)

    fetchProjectDetails()

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [project_id])

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessage, lastUserQuery])

  if (projectState === "loading") {
    return <ProjectLoadingScreen />
  }

  if (projectState === "not-found") {
    return (
      <ProjectErrorState
        message="The requested project could not be found or you don't have access to it."
        onRetry={fetchProjectDetails}
      />
    )
  }

  if (projectState === "ready-to-deploy") {
    return <DeployPrompt onDeploy={handleDeploy} />
  }

  if (projectState === "initializing") {
    return (
      <div className="h-full flex justify-center items-center bg-background">
        <StatusViewer
          project_id={project_id}
          wsUrl={`${process.env.NEXT_PUBLIC_SOCKET_PROTOCOL}://${process.env.NEXT_PUBLIC_BACKEND_SOCKET_URI}/ws/init?project_id=${project_id}`}
          onStatusUpdate={handleProjectStatusUpdate}
          onInitializationComplete={handleInitializationComplete}
        />
      </div>
    )
  }

  // Main playground interface
  return (
    <div className="flex-1 overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={30} className="flex flex-col">
          <div className="flex flex-col h-full">
            {/* Enhanced header */}
            <div className="px-4 py-3 border-b border-border bg-card/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-accent" />
                <h2 className="font-semibold text-card-foreground">AI Assistant</h2>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Connected</span>
                  {hasInitialized && (
                    <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">Deployed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Message display area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="max-w-3xl w-full mx-auto space-y-4">
                {/* Welcome message */}
                {!lastUserQuery && !currentMessage && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">Welcome to your AI Assistant</h3>
                    <p className="text-muted-foreground">
                      Ask me anything about your project, code, or need help with development tasks.
                    </p>
                    {hasInitialized && (
                      <p className="text-xs text-accent mt-2">✨ Project successfully deployed and ready to use!</p>
                    )}
                  </div>
                )}

                {/* User message */}
                {lastUserQuery && <ChatMessage isUser={true} content={lastUserQuery} userEmail={user?.email} />}

                {/* Assistant message */}
                {(currentMessage || isStreaming) && (
                  <ChatMessage isUser={false} content={currentMessage} isStreaming={isStreaming} />
                )}

                <div ref={messageRef} />
              </div>
            </div>

            {/* Enhanced chat input */}
            <div className="px-4 py-3 border-t border-border bg-card/30">
              <ChatInput onSend={handleQuery} isDisabled={isStreaming} />
              {isStreaming && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        <div className="flex items-center">
          <ResizableHandle
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            className="h-[90%] m-0 flex bg-transparent justify-center hover:bg-accent/10 transition-colors"
          />
        </div>

        <ResizablePanel defaultSize={65} minSize={30} className="relative mr-4 mb-4">
          <div
            className={`bg-canvas rounded-xl shadow-lg h-full overflow-hidden border transition-all duration-200 ${
              isDragging ? "border-accent shadow-accent/20" : "border-border/20"
            }`}
          >
            <FileViewer project_id={project_id} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default Playground
