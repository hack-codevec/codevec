"use client"

import { useState, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "@/providers/theme-provider"

interface CodeSnippet {
  language: string
  code: string
}

const codeSnippets: CodeSnippet[] = [
  {
    language: "javascript",
    code: `console.log("Hello, developer! 👋");
console.log("Welcome to our platform");
// We're excited to have you here!`,
  },
  {
    language: "python",
    code: `print("Did you hear about the programmer who got stuck in the shower?")
print("They couldn't find the SOAP! 🧼")
# Ba dum tss! 🥁`,
  },
  {
    language: "javascript",
    code: `// Why do programmers prefer dark mode?
if (programmer.eyes === "tired") {
  console.log("Because light attracts bugs! 🐛");
}`,
  },
  {
    language: "bash",
    code: `$ git commit -m "Fixed bugs"
$ git push
$ git panic # When you realize you pushed to production`,
  },
  {
    language: "javascript",
    code: `function welcomeUser(name) {
  return \`Welcome, \${name || "awesome developer"}!
  We've been expecting you. 🚀\`;
}
welcomeUser();`,
  },
]

export default function CodeDisplay() {
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine the syntax highlighting style based on theme
  const getSyntaxStyle = () => {
    if (!mounted) return atomDark // Default during SSR

    if (theme === "light") return oneLight
    if (theme === "dark") return atomDark

    // For system theme, check the actual applied theme
    if (typeof window !== "undefined") {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      return isDark ? atomDark : oneLight
    }

    return atomDark
  }

  const typingSpeed = 30
  const pauseBetweenSnippets = 3000
  const currentSnippet = codeSnippets[currentSnippetIndex]
  const cursor = "▋"

  useEffect(() => {
    if (!isTyping) return
    if (displayedText.length < currentSnippet.code.length) {
      const typeTimer = setTimeout(() => {
        setDisplayedText(currentSnippet.code.slice(0, displayedText.length + 1))
      }, typingSpeed)
      return () => clearTimeout(typeTimer)
    } else {
      setIsTyping(false)
    }
  }, [displayedText, isTyping, currentSnippet.code, typingSpeed])

  useEffect(() => {
    if (isTyping) return
    const pauseTimer = setTimeout(() => {
      setCurrentSnippetIndex((i) => (i + 1) % codeSnippets.length)
      setDisplayedText("")
      setIsTyping(true)
    }, pauseBetweenSnippets)
    return () => clearTimeout(pauseTimer)
  }, [isTyping, pauseBetweenSnippets])

  return (
    <div className="w-full code-block glass-morphism relative shadow-xl shadow-black/5 border-2 border-border/20">
      <div className="mb-4 flex items-center">
        <div className="mr-2 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: "0.2s" }} />
        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: "0.4s" }} />
        <div className="ml-4 text-sm text-muted-foreground font-mono">terminal@codevec:~</div>
      </div>

      <SyntaxHighlighter
        language={currentSnippet.language}
        style={getSyntaxStyle()}
        wrapLines={true}
        customStyle={{
          background: theme === "light" ? "rgba(248, 250, 252, 0.8)" : "rgba(0, 0, 0, 0.05)",
          padding: "1rem",
          borderRadius: "0.5rem",
          fontSize: "0.9rem",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          border: "1px solid var(--border)",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          },
        }}
      >
        {displayedText + (isTyping ? cursor : "")}
      </SyntaxHighlighter>
    </div>
  )
}
