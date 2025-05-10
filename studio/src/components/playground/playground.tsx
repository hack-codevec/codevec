"use client";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useEffect, useState, useRef } from "react";
import FileViewer from "@/components/file-viewer/file-viewer";
import ChatInput from "@/components/prompt/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { StatusViewer } from "./project-init";

interface PlaygroundProps {
  project_id: string;
}

interface Project {
  id: string;
  status: boolean;
}

const Playground = ({ project_id }: PlaygroundProps) => {
  const [projectStatus, setProjectStatus] = useState<{
    isLoading: boolean;
    exists: boolean;
  }>({
    isLoading: true,
    exists: false,
  });
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const wsBaseUrl = "wss://socket.sasewa.org/ws/stream";

  const supabase = createClient();

  const formatMessageWithCodeBlocks = (message: string) => {
    if (!message) return null;

    // Split by code block markers (triple backticks)
    const parts = message.split(/```([\s\S]*?)```/);

    return parts.map((part, index) => {
      // Even indices are regular text, odd indices are code blocks
      if (index % 2 === 0) {
        // Regular text - split by newlines and create paragraph elements
        return (
          <div key={index}>
            {part.split("\n").map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        );
      } else {
        // Code block - extract language if specified
        const firstLineBreak = part.indexOf("\n");
        const language =
          firstLineBreak > 0 ? part.substring(0, firstLineBreak).trim() : "";
        const code =
          firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part;

        return (
          <pre
            key={index}
            className="bg-muted p-4 rounded-md my-2 overflow-x-auto"
          >
            <code className="text-sm font-mono">{code}</code>
          </pre>
        );
      }
    });
  };

  const fetchProjectDetails = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("project")
        .select("*")
        .eq("id", project_id)
        .single();

      if (error) {
        throw new Error("Failed to fetch project");
      }

      const project = data as Project;
      console.log("Project data:", project);

      if (project.status === true) {
        setProjectStatus({
          isLoading: false,
          exists: true,
        });

        // Connect to WebSocket after confirming project exists
        connectWebSocketForStream();
      } else {
        setProjectStatus({
          isLoading: false,
          exists: false,
        });
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setProjectStatus({
        isLoading: false,
        exists: false,
      });
    }
  };

  const connectWebSocketForStream = async () => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }
    let token;

    const { data, error } = await supabase.auth.getSession();

    if (data.session?.access_token) {
      token = data.session.access_token;
    }
    console.log(token);
    const wsUrl = `${wsBaseUrl}:${encodeURIComponent(
      project_id
    )}?token=${token}`;
    console.log("Connecting to WebSocket:", wsUrl);

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected for streaming");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Handle different message types
        if (data.type === "start") {
          // Clear previous message and start streaming
          setCurrentMessage("");
          setIsStreaming(true);
        } else if (data.type === "content" && data.content) {
          // Append content to current message
          setCurrentMessage((prev) => prev + data.content);
        } else if (data.type === "end") {
          // End streaming
          setIsStreaming(false);
        }
        // Handle step: chunk format
        else if (data.step === "chunk" && data.data) {
          // Append chunk data to current message
          setCurrentMessage((prev) => prev + data.data);
          setIsStreaming(true);
        }
        // Handle step: complete format
        else if (data.step === "complete") {
          // End streaming when complete message is received
          setIsStreaming(false);
        }
        // Handle plain content
        else if (data.content) {
          // Append content to current message
          setCurrentMessage((prev) => prev + data.content);
          setIsStreaming(true);
        }
      } catch (e) {
        console.error("Failed to parse WS message:", e);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsStreaming(false);
    };

    socket.onclose = () => {
      console.warn("WebSocket connection closed");
      setIsStreaming(false);
    };

    socketRef.current = socket;
  };

  const handleQuery = async (query: string) => {
    if (!query.trim() || !socketRef.current) return;

    // Clear current message and set streaming state
    setCurrentMessage("");
    setIsStreaming(true);

    try {
      // Send HTTP request to the backend
      const response = await fetch("https://backend.sasewa.org/v1/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query,
          project_id: project_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // The backend will trigger the WebSocket to stream responses
      console.log("Query sent successfully via HTTP");

      // If the WebSocket is not connected, show an error
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        console.error(
          "WebSocket not connected for receiving streamed response"
        );
        setCurrentMessage(
          "Connected to server, but streaming connection is not available. You may not receive a complete response."
        );
        setIsStreaming(false);
      }
    } catch (error) {
      console.error("Error sending query:", error);
      setCurrentMessage(
        "Sorry, I couldn't send your query to the server. Please try again in a moment."
      );
      setIsStreaming(false);
    }
  };

  // Connect to WebSocket and fetch project details on mount
  useEffect(() => {
    fetchProjectDetails();

    // Cleanup WebSocket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [project_id]);

  // Loading state
  if (projectStatus.isLoading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  // Project exists - show the playground
  if (projectStatus.exists) {
    return (
      <div className="flex-1 overflow-hidden bg-background">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={80}
            minSize={30}
            className="flex flex-col px-2"
          >
            <div className="flex flex-col h-full">
              {/* Message display area */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-3xl w-full mx-auto">
                  {/* Only show current streaming message */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium mb-2">Assistant</div>
                      <div className="text-foreground leading-relaxed overflow-hidden">
                        {formatMessageWithCodeBlocks(currentMessage)}
                        {isStreaming && (
                          <span className="inline-block w-3 h-4 bg-accent animate-pulse rounded-sm ml-1"></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div ref={messageRef} />
                </div>
              </div>
              {/* Chat input - fixed at bottom */}
              <div className="px-4 py-3 border-t border-border">
                <ChatInput onSend={handleQuery} isDisabled={isStreaming} />
              </div>
            </div>
          </ResizablePanel>

          <div className="flex items-center">
            <ResizableHandle
              onPointerDown={() => {
                setIsDragging(true);
              }}
              onPointerUp={() => {
                setIsDragging(false);
              }}
              className={`
                  h-[90%] m-0 flex bg-transparent justify-center
              `}
            />
          </div>

          <ResizablePanel
            defaultSize={60}
            minSize={30}
            className="relative mr-4 mb-4"
          >
            <div
              className={`bg-canvas rounded-xl shadow h-full overflow-hidden ${
                isDragging ? "border-accent border-1" : ""
              }`}
            >
              <FileViewer project_id={project_id} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  // Project doesn't exist - show the status viewer
  return (
    <div className="h-full flex justify-center items-center">
      <StatusViewer
        project_id={project_id}
        wsUrl={`wss://backend.sasewa.org/ws/init?project_id=${project_id}`}
      />
    </div>
  );
};

export default Playground;
