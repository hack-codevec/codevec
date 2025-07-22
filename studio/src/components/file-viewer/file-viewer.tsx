"use client";
import { useEffect, useState } from "react";
import { Code2, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { FileContent, TreeItem, TreeNode } from "./types";
import { FileTree } from "./file-tree";
import { BeforeMount, Editor, OnMount } from "@monaco-editor/react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useTheme } from "@/providers/theme-provider";

interface FileViewerProps {
  project_id: string;
}

const FileViewer = ({ project_id }: FileViewerProps) => {
  const [treeStructure, setTreeStructure] = useState<TreeNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchTree = async () => {
      const response = await apiClient.get(`/v1/tree?project_id=${project_id}`);

      if (response.status) {
        const processedTree = processTreeData(response.data.tree);
        setTreeStructure(processedTree);
      }
    };

    fetchTree();
  }, []);

  // Process flat tree data into hierarchical structure
  const processTreeData = (items: TreeItem[]): TreeNode => {
    const root: TreeNode = {
      name: "root",
      path: "",
      type: "directory",
      children: {},
    };

    // Sort items to ensure directories come before their contents
    const sortedItems = [...items].sort((a, b) => a.path.localeCompare(b.path));

    sortedItems.forEach((item) => {
      const pathParts = item.path.split("/");
      let currentNode = root;

      // For files/directories at the root level
      if (pathParts.length === 1) {
        root.children[item.name] = {
          name: item.name,
          path: item.path,
          type: item.type,
          children: {},
        };
        return;
      }

      // For nested files/directories
      let currentPath = "";
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}\\${part}` : part;

        if (!currentNode.children[part]) {
          // Create directory node if it doesn't exist
          currentNode.children[part] = {
            name: part,
            path: currentPath,
            type: "directory",
            children: {},
          };
        }
        currentNode = currentNode.children[part];
      }

      // Add the final file/directory
      const fileName = pathParts[pathParts.length - 1];
      currentNode.children[fileName] = {
        name: fileName,
        path: item.path,
        type: item.type,
        children: {},
      };
    });

    return root;
  };

  const handleFileClick = async (path: string, name: string) => {
    if (path === selectedFile) return;

    setSelectedFile(path);
    setIsLoading(true);

    try {
      const response = await apiClient.get(
        `/v1/file?file_path=${encodeURIComponent(
          path
        )}&project_id=${project_id}`
      );

      if (response.status) {
        setFileContent({
          content: response.data.content,
          path,
          name,
        });
      } else {
        console.error("Failed to fetch file content");
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine language for syntax highlighting based on file extension
  const getLanguage = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || "";

    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "javascript",
      py: "python",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
      svg: "svg",
      txt: "text",
      sh: "bash",
      bash: "bash",
      mjs: "javascript",
      cjs: "javascript",
      gitignore: "text",
      env: "text",
      example: "text",
    };

    return languageMap[extension] || "text";
  };

  // Check if file is an image
  const isImageFile = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    return ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(extension);
  };

  const beforeMount: BeforeMount = (monaco) => {
    // 1) Disable JS & TS diagnostics (both syntax and semantic)
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
    });

    // 2) Disable JSON validation entirely (if you happen to edit JSON)
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false,
    });

    // Dark theme
    monaco.editor.defineTheme("myCustomDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", background: "111111" },
        { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
        { token: "keyword", foreground: "60a5fa" },
        { token: "identifier", foreground: "f1f5f9" },
        { token: "string", foreground: "ce9178" },
        { token: "number", foreground: "fbbf24" },
        { token: "type", foreground: "a78bfa" },
        { token: "function", foreground: "06b6d4" },
      ],
      colors: {
        "editor.background": "#111111",
        "editor.foreground": "#f1f5f9",
        "editorCursor.foreground": "#ce9178",
        "editor.lineHighlightBackground": "#1e1e1e",
        "editorLineNumber.foreground": "#94a3b8",
        "editorLineNumber.activeForeground": "#f1f5f9",
        "editor.selectionBackground": "#60a5fa40",
        "editor.selectionHighlightBackground": "#60a5fa20",
        "editorIndentGuide.background": "#2a2a2a",
        "editorIndentGuide.activeBackground": "#ce9178",
        "editor.findMatchBackground": "#ce917840",
        "editor.findMatchHighlightBackground": "#ce917820",
        "editorWidget.background": "#1a1a1a",
        "editorWidget.border": "#2a2a2a",
        "editorSuggestWidget.background": "#1a1a1a",
        "editorSuggestWidget.border": "#2a2a2a",
        "editorSuggestWidget.selectedBackground": "#1e1e1e",
        focusBorder: "#00000000",
        "editor.focusedTabBorder": "#00000000",
        "editorGroup.border": "#00000000",
        "editorGroupHeader.tabsBorder": "#00000000",
      },
    });

    // Light theme
    monaco.editor.defineTheme("myCustomLight", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", background: "f8fafc" },
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "2563eb" },
        { token: "identifier", foreground: "0f172a" },
        { token: "string", foreground: "22863a" },
        { token: "number", foreground: "f59e0b" },
        { token: "type", foreground: "7c3aed" },
        { token: "function", foreground: "0891b2" },
      ],
      colors: {
        "editor.background": "#f8fafc",
        "editor.foreground": "#0f172a",
        "editorCursor.foreground": "#22863a",
        "editor.lineHighlightBackground": "#ffffff",
        "editorLineNumber.foreground": "#64748b",
        "editorLineNumber.activeForeground": "#0f172a",
        "editor.selectionBackground": "#2563eb40",
        "editor.selectionHighlightBackground": "#2563eb20",
        "editorIndentGuide.background": "#e2e8f0",
        "editorIndentGuide.activeBackground": "#22863a",
        "editor.findMatchBackground": "#22863a40",
        "editor.findMatchHighlightBackground": "#22863a20",
        "editorWidget.background": "#ffffff",
        "editorWidget.border": "#e2e8f0",
        "editorSuggestWidget.background": "#ffffff",
        "editorSuggestWidget.border": "#e2e8f0",
        "editorSuggestWidget.selectedBackground": "#f8fafc",
        focusBorder: "#00000000",
        "editor.focusedTabBorder": "#00000000",
        "editorGroup.border": "#00000000",
        "editorGroupHeader.tabsBorder": "#00000000",
      },
    });
  };

  const onMount: OnMount = (editor, monaco) => {
    // actually select your custom theme
    if (theme === "light") {
      monaco.editor.setTheme("myCustomLight");
    } else if (theme === "dark") {
      monaco.editor.setTheme("myCustomDark");
    } else if (theme === "system") {
      if (typeof window !== "undefined") {
        const isDark =
          document.documentElement.getAttribute("data-theme") === "dark" ||
          (!document.documentElement.getAttribute("data-theme") &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
        if (isDark) {
          monaco.editor.setTheme("myCustomDark");
        } else {
          monaco.editor.setTheme("myCustomLight");
        }
      }
    }
  };

  return (
    <div className="h-full flex-1 overflow-hidden">
      <div className="w-full border-b border-accent/20 p-2 flex ">
        <div className="flex items-center gap-2 px-2 bg-background rounded-xl text-xs">
          <Code2 className="w-5 text-accent/40" />
          <p>Code</p>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={20}
          minSize={10}
          className="border-accent/20 relative border-r-1"
        >
          <div className="h-full overflow-y-auto scrollbar-subtle py-2">
            {treeStructure ? (
              <FileTree
                node={treeStructure}
                level={0}
                onFileClick={handleFileClick}
                selectedFile={selectedFile}
              />
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Loading files...
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle
          className={`
                h-full m-0 flex bg-transparent justify-center
            `}
        />

        <ResizablePanel defaultSize={60} minSize={30}>
          {/* File Content Panel */}
          <div className="flex flex-col rounded-br-xl h-full">
            {selectedFile ? (
              <>
                <div className="px-2 pb-1">
                  <p className="text-sm text-muted-foreground">
                    {`code > ${selectedFile.replace(/[\\/]+/g, " > ")}`}
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : fileContent ? (
                  isImageFile(fileContent.name) ? (
                    <div className="flex h-full items-center justify-center rounded-lg">
                      <p className="text-muted-foreground">
                        Image preview not available
                      </p>
                    </div>
                  ) : (
                    <Editor
                      key={theme}
                      defaultLanguage={getLanguage(fileContent.name)}
                      defaultValue={fileContent.content}
                      beforeMount={beforeMount}
                      onMount={onMount}
                      options={{
                        wordWrap: "on",
                        minimap: { enabled: false },
                        automaticLayout: true, // Important for resizing
                        scrollBeyondLastLine: true, // Must be true to scroll beyond
                        padding: { bottom: 100 }, // Roughly 5 lines worth of space
                        scrollbar: {
                          vertical: "auto",
                          handleMouseWheel: true,
                        },
                        quickSuggestions: false,
                        suggestOnTriggerCharacters: false,
                        parameterHints: { enabled: false },
                        acceptSuggestionOnEnter: "off",
                        hover: { enabled: false },
                        scrollBeyondLastColumn: 5,
                      }}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                      Failed to load file content
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  Select a file to view its contents
                </p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default FileViewer;
