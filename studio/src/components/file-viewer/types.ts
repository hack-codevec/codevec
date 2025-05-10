export type FileOrDir = "file" | "directory";

export interface TreeItem {
  type: FileOrDir;
  name: string;
  path: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: FileOrDir;
  children: Record<string, TreeNode>;
}

export interface FileContent {
  content: string;
  path: string;
  name: string;
}
