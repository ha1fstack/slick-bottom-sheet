"use client";

import React from "react";
import { SlickBottomSheet, SlickBottomSheetControl } from "slick-bottom-sheet";

export default function Page() {
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
        className="bg-white rounded-t-2xl overflow-hidden shadow-xl z-10 isolate border"
        header={
          <div className="flex flex-col items-center py-2 border-b">
            <div className="w-10 h-1 rounded-full bg-zinc-400" />
            <div className="mt-2 font-semibold text-lg">Sticky Header</div>
          </div>
        }
        footer={
          <div className="p-4 flex flex-col gap-2 border-t">
            <button
              onClick={() => ref.current?.snapTo("close")}
              className="w-full bg-zinc-200 py-2 font-medium rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => ref.current?.snapTo("close")}
              className="w-full bg-indigo-600 py-2 font-medium text-white rounded"
            >
              Done
            </button>
          </div>
        }
        backdropClassName="backdrop-blur-sm bg-black bg-opacity-10"
      >
        <div className="p-4">
          <div className="h-48 grid place-items-center font-bold">
            <div className="text-center">
              <p>You can customize sticky header and footer.</p>
              <p>Sizes are automatically handled.</p>
            </div>
          </div>
        </div>
      </SlickBottomSheet>
    </>
  );
}
