import Playground from "@/components/playground/playground";
import Topbar from "@/components/topbar/Topbar";
import React from "react";

function Studio() {
  return (
    <div className="w-full h-screen flex flex-col">
      <Topbar />
      <Playground />
    </div>
  );
}

export default Studio;
