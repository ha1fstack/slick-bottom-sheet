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
        onCloseStart={() => {
          setIsOpen(false);
        }}
        ref={ref}
        snaps={[300, 0.5, 0.9]}
        defaultSnap={0}
        onSnap={console.log}
        className="bg-white rounded-t-2xl overflow-hidden shadow-xl z-10 isolate"
        header={
          <div className="p-4 border-b border-zinc-300 bg-zinc-100">header</div>
        }
        footer={
          <div className="p-4 border-t border-zinc-300 bg-zinc-100">footer</div>
        }
        backdropClassName="backdrop-blur-sm"
      >
        <div className="p-4">
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
      </SlickBottomSheet>
    </div>
  );
}
```

## To Do

- [ ] More exposed options
- [ ] Add testings
- [ ] Add more examples
- [ ] Improve docs
- [ ] Better A11Y support
