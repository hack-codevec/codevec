"use client"

import { useState, useEffect } from "react"
import { Plus, FolderOpen, AlertCircle, Zap } from "lucide-react"
import { ProjectCard } from "@/components/ui/project-card"
import { AddProjectModal } from "@/components/project/add-project"
import { getProjects } from "@/actions/project-actions"
import type { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Project limit indicator
function ProjectLimitIndicator({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = current >= max

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="relative w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-accent"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground font-mono">
          {current}/{max}
        </span>
      </div>
      {isAtLimit && (
        <div className="flex items-center gap-1 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">Limit reached</span>
        </div>
      )}
    </div>
  )
}

// Enhanced skeleton loader
function ProjectSkeleton() {
  return (
    <Card className="glass-morphism border-border/20 p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded-full w-12"></div>
        </div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 bg-muted rounded-full w-16"></div>
          <div className="h-6 bg-muted rounded-full w-20"></div>
        </div>
      </div>
    </Card>
  )
}

// Empty state component
function EmptyState({ onAddProject }: { onAddProject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6">
      <Card className="glass-morphism border-border/20 p-8 text-center max-w-md animate-scale-in">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground">Connect your first GitHub repository to start building amazing things</p>
        </div>

        <Button
          onClick={onAddProject}
          className="bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add Your First Project
        </Button>

        <div className="mt-6 pt-6 border-t border-border/20">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Fast Setup</span>
            </div>
            <div className="flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              <span>Auto Deploy</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Project limits - you can make this dynamic based on user plan
  const MAX_PROJECTS = 2

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  const handleProjectAdded = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject])
    setIsModalOpen(false)
  }

  const canAddProject = projects.length < MAX_PROJECTS

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-card-foreground">Your Projects</h1>
          <p className="text-muted-foreground">Transform your repositories into knowledge hubs</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <ProjectLimitIndicator current={projects.length} max={MAX_PROJECTS} />
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={!canAddProject}
            className={`${
              canAddProject
                ? "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            } transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="w-4 h-4 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Add Project</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onAddProject={() => setIsModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project, index) => (
            <div key={project.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onProjectAdded={handleProjectAdded} />
    </div>
  )
}
