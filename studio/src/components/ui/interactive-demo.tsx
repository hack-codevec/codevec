"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Send, Github } from "lucide-react"

export default function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [messages, setMessages] = useState<Array<{ type: "user" | "ai"; content: string }>>([])
  const [isTyping, setIsTyping] = useState(false)

  const demoSteps = [
    {
      repo: "facebook/react",
      question: "How does the useState hook work internally?",
      answer:
        "The useState hook is implemented using a fiber node's memoizedState. When called, it creates a hook object that stores the current state value and a queue for updates...",
    },
    {
      repo: "vercel/next.js",
      question: "Explain the App Router architecture",
      answer:
        "Next.js App Router uses a file-system based router built on React Server Components. Each folder represents a route segment that maps to a URL segment...",
    },
  ]

  const simulateChat = async (step: number) => {
    const demo = demoSteps[step]
    setMessages([])

    // Add user message
    setMessages([{ type: "user", content: demo.question }])
    setIsTyping(true)

    // Simulate AI response after delay
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { type: "ai", content: demo.answer }])
    }, 2000)
  }

  useEffect(() => {
    simulateChat(currentStep)
  }, [currentStep])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl font-bold mb-4">See CodeVec in Action</h3>
          <p className="text-muted-foreground mb-6">
            Watch how CodeVec analyzes real repositories and provides intelligent answers
          </p>

          <div className="space-y-4">
            {demoSteps.map((demo, index) => (
              <Button
                key={index}
                variant={currentStep === index ? "default" : "outline"}
                onClick={() => setCurrentStep(index)}
                className="w-full justify-start"
              >
                <Github className="mr-2 h-4 w-4" />
                {demo.repo}
              </Button>
            ))}
          </div>
        </div>

        <Card className="glass-morphism">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-4 text-sm text-muted-foreground">{demoSteps[currentStep].repo}</span>
            </div>

            <div className="space-y-4 min-h-[300px]">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === "user" ? "bg-accent text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    {message.type === "ai" && (
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">CodeVec AI</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center mt-4 p-2 bg-muted rounded-lg">
              <input
                type="text"
                placeholder="Ask about the codebase..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
                disabled
              />
              <Send className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
