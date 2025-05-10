import { Github } from "lucide-react";
import type { Project } from "@/types/project";
import { useRouter } from "next/navigation";

export function ProjectCard({ project }: { project: Project }) {
    const router = useRouter();

    const handleRedirect = () => {
        if(project.id)
        {
            router.push(`/projects/${project.id}`)
        }
    }
  return (
    <div className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 cursor-pointer" onClick={() => handleRedirect()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-md">
              <Github className="h-5 w-5" />
            </div>
            <h3 className="font-medium text-lg truncate">{project.name}</h3>
          </div>
        </div>

        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <span className="flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-1 ${
                project.status ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
            {project.status ? "Active" : "Inactive"}
          </span>
          <span className="mx-2">•</span>
          <span>Created {formatDate(project.created_at)}</span>
        </div>
      </div>

      <div className="border-t border-border p-3 flex justify-between">
        <a
          href={`https://github.com/${project.base_git_url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-4 w-4" />
          <span>View Repository</span>
        </a>
      </div>

    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "today";
  } else if (diffInDays === 1) {
    return "yesterday";
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
