"use client"

import { useState, type KeyboardEvent } from "react"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  isDisabled?: boolean
}

export default function ChatInput({ onSend, isDisabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim() && !isDisabled) {
      onSend(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center space-x-2 max-w-3xl mx-auto">
      <div className="relative flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={isDisabled}
          className={`w-full border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent pr-10 ${
            isDisabled ? "bg-secondary/50 text-muted-foreground" : ""
          }`}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isDisabled}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent p-1 rounded-md ${
            !message.trim() || isDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
