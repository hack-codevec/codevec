"use client";

import { useState } from "react";
import { Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CodeDisplay from "@/components/auth/quotes";
import { Notification } from "@/components/notification";
import { useRouter } from "next/navigation";
import { login } from "@/utils/login/actions";
import { Providers } from "@/types/login";

export default function AuthPage() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const router = useRouter();

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const handleLogin = async (provider:Providers) => {
    try {
      const data = await login(provider);

      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-white">
      {/* Left half - Auth form */}
      <div className="w-full h-3 absolute -top-3 rounded-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400 shadow-[0_0_80px_20px_rgba(13,148,136,0.5)]"></div>
      <div className="flex h-full flex-row items-center justify-center">
        <div className="flex w-full items-center justify-center p-4 md:w-1/2">
          <Card className="w-full max-w-md border-none bg-canvas p-8">
            <div className="mb-8 text-center">
              <div className="flex flex-row items-center justify-center">
                <h1 className="text-3xl font-bold">Code</h1>
                <h1 className="text-3xl font-bold text-accent/60">Vec</h1>
              </div>
              <p className="mt-2 text-gray-400">
                Sign in to continue to the platform
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full bg-gray-800 text-white hover:bg-gray-700"
                  onClick={() => handleLogin("google")}
                  >
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-gray-800 text-white hover:bg-gray-700"
                  onClick={() => handleLogin("github")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Continue with GitHub
                </Button>
              </div>
            </div>
          </Card>
        </div>
        {/* Right half - Code display */}
        <div className="hidden md:flex md:justify-start md:w-1/2">
          <div className="flex w-xl md:w-2xl items-center justify-start p-8">
            <CodeDisplay />
          </div>
        </div>
      </div>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
