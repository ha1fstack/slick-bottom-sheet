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
        <button
          className="px-4 py-2 bg-zinc-100 rounded-md"
          onClick={() => {
            console.log("open");
            setIsOpen(true);
          }}
        >
          Open
        </button>
      </div>
      <SlickBottomSheet
        isOpen={isOpen}
        onCloseStart={() => {
          setIsOpen(false);
        }}
        ref={ref}
        onSnap={console.log}
        snaps={[0.9]}
        autoSnapAsMax={false}
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
        backdropClassName="backdrop-blur-sm bg-black bg-opacity-10"
      >
        <div className="p-4">
          <input
            type="text"
            className="w-full px-4 py-2 bg-white border border-zinc-300 rounded-md"
            placeholder="input"
          />
          <div className="py-8 grid place-items-center font-bold">
            <div className="text-center">
              <p>Content larger than container is automatically handled.</p>
              <p>
                Provides smooth interaction between modal drag and content
                scroll in any device.
              </p>
            </div>
          </div>
          <div className="border rounded bg-zinc-50 px-4 py-3">
            {Array.from({ length: 40 }).map((_, i) => (
              <React.Fragment key={i}>
                tall content
                <br />
              </React.Fragment>
            ))}
          </div>
        </div>
      </SlickBottomSheet>
    </>
  );
}
