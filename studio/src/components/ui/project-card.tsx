"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BotMessageSquare, Github, MoreVertical, Settings, Trash2 } from "lucide-react"
import type { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const getStatusColor = (status: boolean) => {
    return status ? "bg-accent/10 text-accent border-accent/20" : "bg-red-500/10 text-red-600 border-red-500/20"
  }

  const getStatusText = (status: boolean) => {
    return status ? "active" : "inactive"
  }

  // Close menu when clicking outside or leaving the card area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        menuRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false)
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.relatedTarget as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      if (cardRef.current) {
        cardRef.current.addEventListener("mouseleave", handleMouseLeave)
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (cardRef.current) {
        cardRef.current.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [showMenu])

  const handleClick = (e: React.MouseEvent) => {
    router.push(`/projects/${project.id}`)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <Card
      ref={cardRef}
      className="glass-morphism border-border/20 hover:border-accent/30 transition-all duration-300 group hover:shadow-lg hover:shadow-black/5 p-4 relative"
    >
      {/* Status indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </div>

        {/* Menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleMenuClick}
        >
          <MoreVertical className="w-3 h-3" />
        </Button>
      </div>

      {/* Project header */}
      <div className="mb-3 pr-16">
        <div className="flex items-center gap-2 mb-1">
          <Github className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-card-foreground truncate">{project.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          Repository from {new URL(`https://github.com/${project.base_git_url}`).hostname}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs hover:bg-accent/5 hover:border-accent/30 cursor-pointer not-visited:hover:text-accent bg-transparent"
          onClick={(e) =>
            handleButtonClick(e, () => window.open(`https://github.com/${project.base_git_url}`, "_blank"))
          }
        >
          <Github className="w-3 h-3 mr-1" />
          Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs hover:bg-accent/5 hover:border-accent/30 cursor-pointer hover:text-accent bg-transparent"
          onClick={(e) => handleClick(e)}
        >
          <BotMessageSquare className="w-3 h-3 mr-1" />
          Chat
        </Button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-12 right-2 z-20 w-40 bg-card border border-border rounded-lg shadow-xl py-1"
        >
          <button
            className="w-full px-3 py-2 text-left text-xs hover:bg-accent/10 flex items-center gap-2 text-card-foreground transition-colors"
            onClick={(e) =>
              handleButtonClick(e, () => {
                setShowMenu(false)
                router.push(`/projects/${project.id}/settings`)
              })
            }
          >
            <Settings className="w-3 h-3" />
            Settings
          </button>
          <button
            className="w-full px-3 py-2 text-left text-xs hover:bg-red-500/10 text-red-600 flex items-center gap-2 transition-colors"
            onClick={(e) =>
              handleButtonClick(e, () => {
                setShowMenu(false)
                console.log("Delete project:", project.id)
              })
            }
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </Card>
  )
}
