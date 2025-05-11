"use client"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"

interface MarkdownMessageProps {
  content: string
  isStreaming?: boolean
}

export default function MarkdownMessage({ content, isStreaming = false }: MarkdownMessageProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="text-sm font-medium mb-2">CodeVec</div>
      <div className="text-foreground leading-relaxed overflow-hidden markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "")
              return !inline ? (
                <SyntaxHighlighter
                  style={atomDark as any}
                  language={match ? match[1] : "text"}
                  PreTag="div"
                  className="rounded-md my-2 text-sm"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            },
            // Customize other elements
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-3 mt-4">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent/30 pl-4 italic my-4">{children}</blockquote>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            hr: () => <hr className="my-6 border-border" />,
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-border">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
            tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => <th className="px-4 py-2 text-left font-medium">{children}</th>,
            td: ({ children }) => <td className="px-4 py-2">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && <span className="inline-block w-3 h-4 bg-accent animate-pulse rounded-sm ml-1"></span>}
      </div>
    </div>
  )
}
