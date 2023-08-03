"use client";

import React from "react";
import { SlickBottomSheet, SlickBottomSheetControl } from "slick-bottom-sheet";

export default function Home() {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<SlickBottomSheetControl>(null);

  React.useEffect(() => {
    setIsOpen(true);
  }, []);

  return <></>;
}
