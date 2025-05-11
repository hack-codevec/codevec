"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [playgroundExpanded, setPlaygroundExpanded] = useState(false);
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimationTriggered(true);
  }, []);

  const navigateToLogin = () => {
    router.push("/login");
  };

  // Feature cards data - only 4 total (2 on each side)
  const leftFeatures = [
    { name: "Contextful", delay: 0.3 },
    { name: "Multilingual", delay: 0.8 },
  ];

  const rightFeatures = [
    { name: "Intuitive", delay: 0.5 },
    { name: "Accessible", delay: 1.0 },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-center">
      {/* Floating feature cards - Left side */}
      <div className="absolute left-0 h-full w-1/3 pointer-events-none">
        {leftFeatures.map((feature, index) => (
          <div
            key={`left-${index}`}
            className={`absolute feature-card left-[10%] border border-accent/20 bg-canvas rounded-lg w-48 h-auto flex flex-col items-center justify-center text-center transform transition-all duration-1000 hover:scale-105 hover:bg-primary/10 hover:border-primary/40 ${
              animationTriggered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              top: `${25 + index * 40}%`,
              transitionDelay: `${feature.delay}s`,
              animation: animationTriggered
                ? `float-left 8s ease-in-out ${index * 1.5}s infinite`
                : "none",
            }}
          >
            <h3 className="text-xl font-bold text-foreground py-3">
              {feature.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Floating feature cards - Right side */}
      <div className="absolute right-0 h-full w-1/3 pointer-events-none">
        {rightFeatures.map((feature, index) => (
          <div
            key={`right-${index}`}
            className={`absolute feature-card right-[10%] rounded-lg border border-accent/20  bg-canvas w-48 h-auto flex flex-col items-center justify-center text-center transform transition-all duration-1000 hover:scale-105 hover:bg-primary/10 hover:border-primary/40 ${
              animationTriggered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              top: `${25 + index * 40}%`,
              transitionDelay: `${feature.delay}s`,
              animation: animationTriggered
                ? `float-right 8s ease-in-out ${index * 1.5}s infinite`
                : "none",
            }}
          >
            <h3 className="text-xl font-bold text-foreground py-3">
              {feature.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Title and Subtitle */}
      <div
        className={`text-center max-w-3xl px-4 transition-opacity duration-700 z-10 ${
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
          CodeVec is an agentic multi-language tool that summarizes code at the
          function, module, and project levels, making it easy to understand,
          document, and onboard fast. But it's more than a summarizer.
        </p>

        <Button
          onClick={navigateToLogin}
          className={`mt-8 bg-accent/40 text-white px-6 py-3 text-lg font-medium hover:bg-accent/70 group ${
            animationTriggered
              ? "animate-from-bottom-delayed-more"
              : "opacity-0"
          }`}
        >
          Get Started{" "}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
