"use client";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useState } from "react";
import FileViewer from "@/components/file-viewer/file-viewer";
import ChatInput from "@/components/prompt/input";

const Playground = () => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex-1 overflow-hidden bg-background">

      <ResizablePanelGroup direction="horizontal">

        <ResizablePanel defaultSize={40} minSize={20} className="p-2">
          <div className="px-4 flex flex-col justify-between">
            <div></div>
            <div>
              <ChatInput  onSend={()=> { return }}/>
            </div>
          </div>
        </ResizablePanel>

        <div className="flex items-center">
          <ResizableHandle
            // on press, grab pointer capture so we keep receiving pointerup
            onPointerDown={() => {
              setIsDragging(true);
            }}
            // when the press ends (even if outside), release and clear state
            onPointerUp={() => {
              setIsDragging(false);
            }}
            className={`
                h-[90%] m-0 flex bg-transparent justify-center
            `}
          />
        </div>

        <ResizablePanel defaultSize={60} minSize={30} className="relative mr-4 mb-4">
          <div
            className={`bg-canvas rounded-xl shadow h-full overflow-hidden ${
              isDragging ? "border-accent border-1" : ""
            }`}
          >
              <FileViewer />
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
};

export default Playground;
