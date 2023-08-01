import { useDebugValue, useEffect, useRef } from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

export function useScrollLock({
  targetRef,
  enabled,
  reserveScrollBarGap,
}: {
  targetRef: React.RefObject<Element>;
  enabled: boolean;
  reserveScrollBarGap: boolean;
}) {
  const ref = useRef<{ activate: () => void; deactivate: () => void }>({
    activate: () => {
      throw new TypeError("Tried to activate scroll lock too early");
    },
    deactivate: () => {},
  });

  useDebugValue(enabled ? "Enabled" : "Disabled");

  useEffect(() => {
    if (!enabled) {
      ref.current.deactivate();
      ref.current = { activate: () => {}, deactivate: () => {} };
      return;
    }

    const target = targetRef.current;
    if (!target) return;
    let active = false;

    ref.current = {
      activate: () => {
        if (active) return;
        active = true;
        disableBodyScroll(target, {
          allowTouchMove: (el) =>
            !!el.closest("[data-body-scroll-lock-ignore]"),
          reserveScrollBarGap,
        });
      },
      deactivate: () => {
        if (!active) return;
        active = false;
        enableBodyScroll(target);
      },
    };
  }, [enabled, targetRef, reserveScrollBarGap]);

  return ref;
}
