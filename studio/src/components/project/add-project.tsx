"use client"

import type React from "react"

import { useState } from "react"
import { X, Loader2, AlertCircle, Github, FolderPlus } from "lucide-react"
import { addProject } from "@/actions/project-actions"
import type { Project } from "@/types/project"
import { AxiosError } from "axios"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectAdded: (project: Project) => void
}

export function AddProjectModal({ isOpen, onClose, onProjectAdded }: AddProjectModalProps) {
  const [projectName, setProjectName] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddProject = async () => {
    if (!githubUrl || !projectName) return

    setIsAdding(true)
    setError(null)

    try {
      const { project, error } = await addProject(githubUrl, projectName)
      if (error) {
        throw error
      }
      if (project) {
        onProjectAdded(project)
        setProjectName("")
        setGithubUrl("")
        setError(null)
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data.message || "Failed to add project")
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to add project")
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleClose = () => {
    if (!isAdding) {
      setError(null)
      setProjectName("")
      setGithubUrl("")
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <Card className="glass-morphism border-border/20 p-0 shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Add New Project</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isAdding}
            className="h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="projectName" className="block text-sm font-medium text-card-foreground">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Project"
              className="w-full bg-card border border-border/30 rounded-lg px-4 py-3 text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAdding}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="githubUrl" className="block text-sm font-medium text-card-foreground">
              GitHub Repository
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="githubUrl"
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="username/repository"
                className="w-full bg-card border border-border/30 rounded-lg pl-10 pr-4 py-3 text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isAdding}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the repository in the format: username/repository-name
            </p>
          </div>

          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 animate-slide-in-left">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/20 p-6 flex justify-end gap-3 bg-card/30">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAdding}
            className="hover:bg-muted/50 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddProject}
            disabled={!githubUrl.trim() || !projectName.trim() || isAdding}
            className="bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2 relative z-10" />
                <span className="relative z-10">Adding...</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">Add Project</span>
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
