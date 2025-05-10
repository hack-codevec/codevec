"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { ProjectCard } from "@/components/ui/project-card"
import { AddProjectModal } from "@/components/project/add-project"
import { getProjects } from "@/actions/project-actions"
import type { Project } from "@/types/project"

export function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-secondary animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-secondary/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Add your first GitHub project to get started</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
          >
            Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onProjectAdded={handleProjectAdded} />
    </div>
  )
}
