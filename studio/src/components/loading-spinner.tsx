"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  color?: "primary" | "accent" | "muted"
}

export function LoadingSpinner({ size = "md", className, color = "accent" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  const colorClasses = {
    primary: "border-primary",
    accent: "border-accent",
    muted: "border-muted-foreground",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-transparent",
        sizeClasses[size],
        `${colorClasses[color]} border-t-transparent`,
        className,
      )}
      style={{
        borderTopColor: "transparent",
        borderRightColor: "currentColor",
        borderBottomColor: "currentColor",
        borderLeftColor: "transparent",
      }}
    />
  )
}

// Inline loading component for buttons and small spaces
export function InlineLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}

// Page-level loading overlay
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
