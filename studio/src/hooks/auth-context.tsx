"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, role } from "@/types/login";

export type Providers = "google" | "github";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {
    throw new Error("AuthContext not initialized");
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data: authUser, error } = await supabase.auth.getUser();
        const { data: sess, error:e } = await supabase.auth.getSession();

        console.log(sess)
        
        if (error) {
          throw new Error("Unauthorized access");
        }

        if (authUser.user) {
          const currUser = authUser.user;
          if (currUser.email && currUser.role) {
            const refreshedUser: User = {
              role: currUser.role as role,
              email: currUser.email,
            };
            setUser(refreshedUser);
          }
        }else{
          throw new Error("User session not found");
        }
      } catch (error) {
        if (error) {
          await logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);


  const logout = async () => {
    try {
      const supabase = createClient();
      supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
