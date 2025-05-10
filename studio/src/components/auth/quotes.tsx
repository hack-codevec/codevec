"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeSnippet {
  language: string;
  code: string;
}

// pulled out so it never re-allocates on every render
const codeSnippets: CodeSnippet[] = [
  {
    language: "javascript",
    code: `console.log("Hello, developer! 👋");
console.log("Welcome to our platform");
// We're excited to have you here!`,
  },
  {
    language: "python",
    code: `print("Did you hear about the programmer who got stuck in the shower?")
print("They couldn't find the SOAP! 🧼")
# Ba dum tss! 🥁`,
  },
  {
    language: "javascript",
    code: `// Why do programmers prefer dark mode?
if (programmer.eyes === "tired") {
  console.log("Because light attracts bugs! 🐛");
}`,
  },
  {
    language: "bash",
    code: `$ git commit -m "Fixed bugs"
$ git push
$ git panic # When you realize you pushed to production`,
  },
  {
    language: "javascript",
    code: `function welcomeUser(name) {
  return \`Welcome, \${name || "awesome developer"}! 
  We've been expecting you. 🚀\`;
}

welcomeUser();`,
  },
];

export default function CodeDisplay() {
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const typingSpeed = 30; // ms per character
  const pauseBetweenSnippets = 3000; // ms after a snippet finishes

  const currentSnippet = codeSnippets[currentSnippetIndex];
  const cursor = "▋";

  // TYPING effect: type one char at a time
  useEffect(() => {
    if (!isTyping) return;

    if (displayedText.length < currentSnippet.code.length) {
      const typeTimer = setTimeout(() => {
        setDisplayedText(
          currentSnippet.code.slice(0, displayedText.length + 1)
        );
      }, typingSpeed);
      return () => clearTimeout(typeTimer);
    } else {
      // finished typing current snippet
      setIsTyping(false);
    }
  }, [displayedText, isTyping, currentSnippet.code, typingSpeed]);

  // PAUSE + ADVANCE effect: wait, then go to next snippet
  useEffect(() => {
    if (isTyping) return;

    const pauseTimer = setTimeout(() => {
      setCurrentSnippetIndex((i) => (i + 1) % codeSnippets.length);
      setDisplayedText("");
      setIsTyping(true);
    }, pauseBetweenSnippets);

    return () => clearTimeout(pauseTimer);
  }, [isTyping, pauseBetweenSnippets]);

  return (
    <div className="w-full rounded-lg bg-canvas p-6 shadow-xl">
      <div className="mb-4 flex items-center">
        <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
        <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <div className="ml-4 text-sm text-gray-400">terminal@dev:~</div>
      </div>
      <SyntaxHighlighter
        language={currentSnippet.language}
        style={atomDark}
        wrapLines={true}
        customStyle={{
          background: "",
          padding: "1rem",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap", // optional here
          overflowWrap: "break-word", // ensure long words break
          wordBreak: "break-word",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            wordBreak: "break-word",
          },
        }}
      >
        {displayedText + (isTyping ? cursor : "")}
      </SyntaxHighlighter>
    </div>
  );
}
