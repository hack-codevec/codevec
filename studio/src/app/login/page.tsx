"use client";
import React, { useEffect } from "react";
import AuthPage from "@/components/auth/auth-form";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function page() {
    const router = useRouter();

    useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient();
      const { data: authUser, error } = await supabase.auth.getUser();
      if (authUser.user) {
        router.push("/projects");
      }
    };

    fetchSession();
  }, []);
  return (
    <>
      <AuthPage />
    </>
  );
}

export default page;
