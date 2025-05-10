"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function page() {
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient();
      const { data: authUser, error } = await supabase.auth.getUser();
      if (authUser.user) {
        router.push("/playground")
      }
    };

    fetchSession();
  }, []);

  return (
    <>
      <div>Landing page</div>
    </>
  );
}

export default page;
