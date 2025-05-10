import { cn } from "@/lib/utils";
import { useState } from "react";
import { TreeNode } from "./types";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";


interface FileTreeProps {
  node: TreeNode;
  level: number;
  onFileClick: (path: string, name: string) => void;
  selectedFile: string | null;
}

export function FileTree({ node, level, onFileClick, selectedFile }: FileTreeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = Object.keys(node.children).length > 0;
  const isRoot = node.name === "root";

  if (isRoot) {
    return (
      <div className="space-y-1">
        {Object.values(node.children)
          .sort((a, b) => {
            // Sort directories first, then files
            if (a.type !== b.type) {
              return a.type === "directory" ? -1 : 1;
            }
            // Then sort alphabetically
            return a.name.localeCompare(b.name);
          })
          .map((childNode) => (
            <FileTree
              key={childNode.path}
              node={childNode}
              level={level}
              onFileClick={onFileClick}
              selectedFile={selectedFile}
            />
          ))}
      </div>
    );
  }

  const isSelected = node.path === selectedFile;

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 rounded cursor-pointer",
          isSelected ? "bg-gray-700/30" : "",
          expanded && hasChildren && "font-medium"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (node.type === "directory") {
            setExpanded(!expanded);
          } else {
            onFileClick(node.path, node.name);
          }
        }}
      >
        {node.type === "directory" ? (
          <>
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground shrink-0" />
              )
            ) : (
              <span className="w-4 mr-1" />
            )}
            <Folder className="h-4 w-4 mr-2 text-accent/70 shrink-0" />
            <span className="truncate">{node.name}</span>
            {hasChildren && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({Object.keys(node.children).length})
              </span>
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
            <span className="truncate">{node.name}</span>
          </>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {Object.values(node.children)
            .sort((a, b) => {
              // Sort directories first, then files
              if (a.type !== b.type) {
                return a.type === "directory" ? -1 : 1;
              }
              // Then sort alphabetically
              return a.name.localeCompare(b.name);
            })
            .map((childNode) => (
              <FileTree
                key={childNode.path}
                node={childNode}
                level={level + 1}
                onFileClick={onFileClick}
                selectedFile={selectedFile}
              />
            ))}
        </div>
      )}
    </div>
  );
}
