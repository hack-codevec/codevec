"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

function page() {
  const router = useRouter();
  const [playgroundExpanded, setPlaygroundExpanded] = useState(false);
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimationTriggered(true);
  }, []);

  const togglePlayground = () => {
    setPlaygroundExpanded(!playgroundExpanded);
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePlayground();
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/80 via-black/20 text-foreground flex flex-col items-center justify-center">
      {/* Title and Subtitle */}
      <div
        className={`text-center max-w-3xl px-4 transition-opacity duration-700 ${
          playgroundExpanded ? "opacity-0" : "opacity-100"
        }`}
      >
        <h1
          className={`text-6xl md:text-8xl font-bold mb-6 ${
            animationTriggered ? "animate-from-bottom" : "opacity-0"
          }`}
        >
          Code<span className="font-bold text-accent/60">Vec</span>
        </h1>
        <p
          className={`text-lg md:text-xl text-foreground/80 leading-relaxed ${
            animationTriggered ? "animate-from-bottom-delayed" : "opacity-0"
          }`}
        >
          CodeVec is a agentic multi-language tool that summarizes code at the
          function, module, and project levels—making it easy to understand,
          document, and onboard fast. But it's more than a summarizer.
        </p>
      </div>

      {/* Playground */}
      <div
        className={`absolute focus-visible playground-mobile w-[80%] left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out cursor-pointer z-20 ${
          playgroundExpanded ? "bottom-[10vh] h-[80vh]" : "bottom-0 h-[10vh]"
        }`}
        onClick={togglePlayground}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={playgroundExpanded}
        aria-label="Interactive code playground"
        aria-controls="playground-content"
      >
        <div
          id="playground-content"
          className="relative w-full h-full bg-primary/80 rounded-t-3xl overflow-hidden"
        >
          {/* Get Started Button - only visible when expanded */}
          <div
            className={`absolute top-4 right-4 z-10 transition-opacity duration-500 ${
              playgroundExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigateToLogin();
              }}
              className="bg-accent text-accent-foreground text-base font-medium p-3 hover:bg-accent/90 border-2 border-accent focus-visible"
            >
              Get Started
            </Button>
          </div>

          {/* Coder workspace image */}
          <div className="relative w-full h-full">
            <Image
              src="/database_img.jpeg"
              alt="Programmer workspace with multiple monitors"
              fill
              className={`object-cover object-top transition-all duration-700 ${
                playgroundExpanded ? "opacity-80" : "opacity-30"
              }`}
              priority
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
