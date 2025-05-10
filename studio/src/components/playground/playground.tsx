"use client";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useState } from "react";
import FileViewer from "@/components/file-viewer/file-viewer";
import ChatInput from "@/components/prompt/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

interface PlaygroundProps {
  project_id : string
}
const Playground = ( { project_id } : PlaygroundProps ) => {

  console.log(project_id)
  const [isDragging, setIsDragging] = useState(false);
  // Sample messages for demonstration
  const messages = [
    { role: "assistant", content: "Hello! How can I help you today?" },
    { role: "user", content: "I have a question about the new features." },
    {
      role: "assistant",
      content:
        "Sure, I'd be happy to explain the new features. What would you like to know?",
    },
    { role: "user", content: "Can you tell me about the chat interface?" },
    {
      role: "assistant",
      content:
        "The chat interface is designed to be clean and intuitive. Messages are displayed chronologically, with clear indicators for who is speaking. You can type your messages in the input field at the bottom.",
    },
    { role: "user", content: "How do I customize the appearance?" },
    {
      role: "assistant",
      content:
        "You can customize the appearance through theme settings. We support both light and dark modes, and you can adjust various elements to match your preferences.",
    },
    { role: "user", content: "That sounds great, thanks!" },
  ];

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={80}
          minSize={30}
          className="flex flex-col px-2"
        >
          <div className="flex flex-col h-full">
            {/* Chat messages area - scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {message.role === "assistant" ? (
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot size={16} />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          <User size={16} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">
                        {message.role === "assistant" ? "Assistant" : "You"}
                      </div>
                      <div className="text-foreground leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Chat input - fixed at bottom */}
            <div className="px-4 py-3 border-t border-border">
              <ChatInput
                onSend={() => {
                  return;
                }}
              />
            </div>
          </div>
        </ResizablePanel>

        <div className="flex items-center">
          <ResizableHandle
            // on press, grab pointer capture so we keep receiving pointerup
            onPointerDown={() => {
              setIsDragging(true);
            }}
            // when the press ends (even if outside), release and clear state
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
            <FileViewer />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Playground;
