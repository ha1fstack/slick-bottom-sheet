"use client";

import React from "react";
import { SlickBottomSheet } from "slick-bottom-sheet";

export default function Home() {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<any>(null);

  return (
    <div className="w-screen h-[100dvh] grid place-items-center relative container max-w-3xl">
      <div className="grid place-items-center">
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
        onClose={() => {
          console.log("close");
          setIsOpen(false);
        }}
        ref={ref}
        snaps={[300, 0.5, 0.9]}
        defaultSnap={0}
        onSnap={(snap) => {
          console.log(snap);
        }}
        className="bg-white rounded-t-2xl overflow-hidden shadow-xl z-10 isolate"
      >
        <div className="sticky top-0 p-4 border-b border-zinc-300 bg-zinc-100">
          header
        </div>
        <div className="p-4">
          <div className="">
            <input
              type="text"
              className="w-full px-4 py-2 bg-white border border-zinc-300 rounded-md"
              placeholder="input"
            />
            <div className="mt-3">
              {Array.from({ length: 35 }).map((_, i) => (
                <React.Fragment key={i}>
                  scrollable body
                  <br />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 p-4 border-t border-zinc-300 bg-zinc-100">
          footer
        </div>
      </SlickBottomSheet>
    </div>
  );
}
