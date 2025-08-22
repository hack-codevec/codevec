"use client"

import React, { useEffect, useState } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { UserButton } from "./User";
import { createClient } from "@/utils/supabase/client";

function Topbar() {
  const [userData, setUserData] = useState({
      email: "",
      name: "",
      imageUrl: ""
  })

  useEffect(()=>{
    const fetchUserDetail = async () => {
      const supabase =  createClient();
      const { data: userSession, error } = await supabase.auth.getSession();

      if(error){
        throw new Error("User not found")
      }

      const user = userSession.session?.user;
      if(user){
        setUserData({
          email: user?.email || "",
          name: user?.user_metadata.full_name || "",
          imageUrl: user.user_metadata.avatar_url || ""
        })
      }
    }
    fetchUserDetail();
  })
  return (
    <div className="relative w-full h-14 bg-background grid grid-cols-4 items-center gap-2 px-2 py-2">
      <div className="col-span-1 flex flex-row items-center justify-start">  
        {
          userData.imageUrl ? 
            <UserButton email={ userData.email } name={ userData.name} imageUrl={ userData.imageUrl } /> 
          : ""
        }
      </div>

      <div className="col-span-3 flex flex-row items-center justify-end gap-3 pr-2">
      <ThemeToggle />
      </div>
    </div>
  );
}

export default Topbar;
