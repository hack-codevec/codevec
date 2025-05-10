"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SendIcon, Loader2, SearchIcon, GlobeIcon, BookOpenIcon, CodeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string, mode?: string) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export default function ChatInput({
  onSend,
  isLoading = false,
  placeholder = "Message ChatGPT...",
  className,
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px" // Reset height
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input.trim(), activeMode || undefined)
      setInput("")
      setActiveMode(null)
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "24px"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  const modes = [
    { id: "default", label: "Default", icon: <BookOpenIcon className="h-3 w-3 mr-1" /> },
    { id: "search", label: "Web Search", icon: <SearchIcon className="h-3 w-3 mr-1" /> }
  ]

  return (
    <div className={cn("w-full max-w-4xl mx-auto px-4", className)}>
      <div className="flex items-center justify-center mb-2 space-x-2 overflow-x-auto py-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setActiveMode(mode.id === "default" ? null : mode.id)}
            className={cn(
              "flex items-center text-sm px-3 py-1.5 rounded-full whitespace-nowrap border-2 border-transparent transition-all duration-200 ease-in-out",
              activeMode === mode.id || (mode.id === "default" && activeMode === null)
                ? "bg-gray-100 text-background"
                : "bg-canvas/100 text-foreground hover:border-1 hover:bg-canvas/20 hover:border-accent/40",
            )}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative border-none flex items-end w-full rounded-xl border bg-canvas shadow-sm transition-all duration-200"
      >
        <textarea
          ref={textareaRef}
          className="w-full resize-none bg-transparent py-4 pl-4 pr-12 text-base outline-none max-h-[200px] overflow-y-auto focus:outline-none"
          rows={1}
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={{ scrollbarWidth: "thin" }}
        />
        <button
          type="submit"
          className={cn(
            "absolute bottom-3 right-3 p-1.5 rounded-lg transition-all duration-200",
            input.trim() && !isLoading
              ? "bg-black text-white hover:bg-gray-800"
              : "text-gray-400 bg-gray-100 cursor-not-allowed",
          )}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
        </button>
      </form>

      {activeMode && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          {activeMode === "search" && "Using Deep Research mode for comprehensive answers"}
        </div>
      )}
       {!activeMode && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          ChatGPT can make mistakes. Consider checking important information.
        </div>
      )}
    </div>
  )
}
