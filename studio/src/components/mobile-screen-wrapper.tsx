"use client"

import React, { useEffect, useState } from "react";
import Topbar from "./topbar/Topbar";
import Playground from "./playground/playground";
import { Smartphone } from "lucide-react";

interface MobileScreenWrapperProps {
  project_id: string;
}

function MobileScreenWrapper({ project_id }: MobileScreenWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2 pt-8">
            <div className="flex justify-center mb-4">
              <Smartphone className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Please Switch to Desktop</h1>
            <p className="text-muted-foreground text-sm">
              This application requires a desktop screen for the best experience
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium text-sm mb-2">To continue:</p>
              <p className="text-xs text-muted-foreground">
                Open this page on a desktop computer or tablet with a screen
                width of at least 768px
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>• Desktop Experience Required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <Playground project_id={project_id} />
    </>
  );
}

export default MobileScreenWrapper;
