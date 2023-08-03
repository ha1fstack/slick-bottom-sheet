# Slick Bottom Sheet

Modern bottom sheet component for React, built with [Framer Motion](https://github.com/framer/motion).

## Introduction

Slick Bottom Sheet is a bottom sheet component with buttery smooth animation and user friendly interactions for React. The gestures and animations are handled with Framer Motion. It aims to provide a simple and flexible API that works out of the box, with minimal dependencies.

## Install

This package requires framer-motion as a peer dependency.

```bash
npm install slick-bottom-sheet
yarn add slick-bottom-sheet
pnpm install slick-bottom-sheet
```

## Demo

[slick-bottom-sheet.vercel.app](https://slick-bottom-sheet.vercel.app/)

or clone the repo and run the `./example` Next.JS app locally.

## API Reference

For now, please refer to JSDoc and demo source code.

## Example

```tsx
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
          <div className="h-48 grid place-items-center font-bold">
            <div className="text-center">
              <p className="text-3xl mb-4">Hello There!</p>
              <p>
                This is a sheet demo with default breakpoint [&quot;auto&quot;].
              </p>
              <p>You can drag the sheet or backdrop to control the sheet.</p>
            </div>
          </div>
        </div>
      </SlickBottomSheet>
    </>
  );
}
```

## To Do

- [ ] More exposed options
- [ ] Add testings
- [ ] Add more examples
- [ ] Improve docs
- [ ] Better A11Y support
