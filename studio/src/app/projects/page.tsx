import { ProjectsPage } from "@/components/project/project-view";
import Topbar from "@/components/topbar/Topbar";
import React from "react";

function page() {
  return (
    <div className="w-full h-screen flex flex-col">
      <Topbar />
      <ProjectsPage />
    </div>
  );
}

export default page;
