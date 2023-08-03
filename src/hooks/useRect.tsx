import React from "react";

const getRect = (element: HTMLElement) => {
  return element.getBoundingClientRect();
};

export function useRect<T extends HTMLElement>(
  ref: React.RefObject<HTMLElement>,
  params?: {
    onResize?: (rect: DOMRect) => void;
    onMount?: (rect: DOMRect) => void;
  },
): DOMRect | null {
  const { onResize, onMount } = params || {};

  const [rect, setRect] = React.useState(
    ref.current ? getRect(ref.current) : null,
  );
  const mount = React.useRef(false);

  const handleResize = React.useCallback(() => {
    if (!ref.current) return;
    const rect = getRect(ref.current);

    setRect(rect);
    if (onResize) onResize(rect);
    if (!mount.current) {
      mount.current = true;
      if (onMount) onMount(rect);
    }
  }, [onMount, onResize]);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    handleResize();
    if (typeof ResizeObserver === "function") {
      let resizeObserver: ResizeObserver | null = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(element);

      return () => {
        if (!resizeObserver) return;
        resizeObserver.disconnect();
        resizeObserver = null;
      };
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, ref]);

  return rect;
}
