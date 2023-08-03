"use client";

import React from "react";
import { SlickBottomSheet, SlickBottomSheetControl } from "slick-bottom-sheet";

export default function Home() {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<SlickBottomSheetControl>(null);

  React.useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <div className="grid place-items-center h-full">
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-zinc-100 rounded-md"
            onClick={() => {
              console.log("open");
              setIsOpen(true);
            }}
          >
            Open
          </button>
          <button
            className="px-4 py-2 bg-zinc-100 rounded-md"
            onClick={() => {
              ref.current?.snapTo("close");
            }}
          >
            Close
          </button>
        </div>
      </div>
      <SlickBottomSheet
        isOpen={isOpen}
        onCloseStart={() => {
          setIsOpen(false);
        }}
        ref={ref}
        onSnap={console.log}
        backdropBlock={false}
        className="bg-white rounded-t-2xl overflow-hidden shadow-xl z-10 isolate border"
        header={
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 rounded-full bg-zinc-400" />
          </div>
        }
        footer={
          <div className="p-4">
            <button
              onClick={() => ref.current?.snapTo("close")}
              className="w-full bg-indigo-600 py-2 font-medium text-white rounded"
            >
              Dismiss
            </button>
          </div>
        }
        backdropClassName="bg-black bg-opacity-10"
      >
        <div className="p-4">
          <div className="h-48 grid place-items-center font-bold">
            <div className="text-center">
              <p>The backdrop is not blocking pointer events.</p>
            </div>
          </div>
        </div>
      </SlickBottomSheet>
    </>
  );
}
