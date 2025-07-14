"use client"

import { useState, type KeyboardEvent, useRef, useLayoutEffect } from "react"
import { Send } from "lucide-react"
import clsx from "clsx" // Optional utility for classNames, or use a template string

interface ChatInputProps {
  onSend: (message: string) => void
  isDisabled?: boolean
}

export default function ChatInput({ onSend, isDisabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isScrollable, setIsScrollable] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX_HEIGHT = 200

  const handleSend = () => {
    if (message.trim() && !isDisabled) {
      onSend(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize + track scrollability
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`
      setIsScrollable(textarea.scrollHeight > MAX_HEIGHT)
    }
  }, [message])

  return (
    <div className="flex items-center space-x-2 max-w-3xl mx-auto">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={isDisabled}
          rows={1}
          className={clsx(
            "w-full bg-canvas border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent pr-10 resize-none max-h-[200px]",
            isDisabled && "bg-secondary/50 text-muted-foreground",
            isScrollable ? "overflow-y-auto" : "overflow-hidden"
          )}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isDisabled}
          className={clsx(
            "absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent p-1 rounded-md",
            (!message.trim() || isDisabled) && "opacity-50 cursor-not-allowed"
          )}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
