"use client";

import { useTheme } from "@/providers/theme-provider";
import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="
    glass-morphism border-border/20 hover:border-accent/30 transition-all duration-300 group hover:shadow-lg hover:shadow-black/5 cursor-pointer
    flex items-center justify-center shadow-cyan-100 p-1 border-1 rounded-full bg-secondary backdrop-blur-sm space-x-6"
    >
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-all ${
          theme === "light"
            ? "bg-transparent text-accent"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Light theme"
      >
        <Sun size={18} />
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full transition-all ${
          theme === "system"
            ? "bg-transparent text-accent"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="System theme"
      >
        <Monitor size={18} />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-all ${
          theme === "dark"
            ? "bg-transparent text-accent"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Dark theme"
      >
        <Moon size={18} />
      </button>
    </div>
  );
}
