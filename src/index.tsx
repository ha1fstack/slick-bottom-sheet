"use client";

import React from "react";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRect } from "./hooks/useRect";
import { Snap, SnapPoint, useSnapPoint } from "./hooks/useSnapPoint";

export interface SnapConfig {
  /**
   * Initial snap when opened, provide "auto" or index of {@link SnapConfig.snaps}
   * @type {number | "auto"}
   * @default "auto"
   */
  defaultSnap?: number | "auto";
  /**
   * Whether to use auto height of content as snap
   * @type {boolean}
   * @default true
   */
  useAutoSnap?: boolean;
  /**
   * List of snaps. If <= 1, it will be calculated as a percentage of the container height.
   * @type {number[]}
   * @default []
   */
  snaps?: number[];
  /**
   * Whether to ignore snaps taller than content height.
   * @type {boolean}
   * @default true
   */
  autoSnapAsMax?: boolean;
  /**
   * Whether to use close snap that triggers close behavior when snapped to.
   * @type {boolean}
   * @default true
   */
  useCloseSnap?: boolean | number;
  /**
   * On snap change callback
   */
  onSnap?: (snap: SnapPoint) => void;
}

export interface SlickBottomSheetProps extends SnapConfig {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
}

interface InnerSlickBottomSheetProps extends SnapConfig {
  className?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export const SlickBottomSheet = React.forwardRef(
  (props: SlickBottomSheetProps, ref) => {
    const [ready, setReady] = React.useState(false);
    React.useEffect(() => {
      setReady(true);
    }, []);

    if (!ready || !props.isOpen) return null;

    const { children, ...rest } = props;
    return (
      <InnerSlickBottomSheet ref={ref} {...rest}>
        {children}
      </InnerSlickBottomSheet>
    );
  },
);
SlickBottomSheet.displayName = "SlickBottomSheet";

const InnerSlickBottomSheet = React.forwardRef(
  (props: InnerSlickBottomSheetProps, ref) => {
    const dragControls = useDragControls();
    const y = useMotionValue(0);
    const yVelocity = useVelocity(y);
    const wrapperHeight = useTransform(y, (v) => Math.abs(v));

    const [containerRect, containerRef] = useRect<HTMLDivElement>();
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const controller = React.useRef<{
      currentSnap: null | SnapPoint;
      prevCurrentSnap: null | SnapPoint;
      minMax: "min" | "max" | null;
      setSnap: (
        data: Snap,
        target: string | number | SnapPoint,
      ) => {
        move: (animation?: boolean) => void;
      };
    }>({
      currentSnap: null,
      prevCurrentSnap: null,
      minMax: null,
      setSnap(data: Snap, target: string | number | SnapPoint) {
        const snap = data.getNearestByIndex(
          typeof target === "string" || typeof target === "number"
            ? target
            : target.index,
        );
        this.prevCurrentSnap = this.currentSnap
          ? { ...this.currentSnap }
          : null;
        this.currentSnap = snap;

        props.onSnap?.(snap);
        return {
          move: (animation = true) => {
            animate(y, snap.value, {
              duration: animation ? undefined : 0,
            });
          },
        };
      },
    });

    useMotionValueEvent(yVelocity, "change", () => {
      if (!snapPoints) return;

      const velocity = yVelocity.get();
      const position = y.get();

      const closePosition = snapPoints.getByIndex("close")?.value;
      if (
        closePosition !== undefined &&
        position === closePosition &&
        velocity === 0
      ) {
        props.onClose();
        return;
      }

      if (isDraggingRef.current) return;

      if (position - snapPoints.maxSnap.value < 30) {
        controller.current.minMax = "max";
      } else if (position - snapPoints.minSnap.value > -30) {
        controller.current.minMax = "min";
      } else {
        controller.current.minMax = null;
      }
    });

    const snapPoints = useSnapPoint({
      containerRect,
      contentRef: scrollRef,
      config: {
        snaps: props.snaps,
        defaultSnap: props.defaultSnap,
        useAutoSnap: props.useAutoSnap,
        autoSnapAsMax: props.autoSnapAsMax,
        useCloseSnap: props.useCloseSnap,
      },
      onChange: (data) => {
        if (
          !controller.current.currentSnap ||
          !controller.current.prevCurrentSnap
        ) {
          return;
        }
        controller.current
          .setSnap(data, controller.current.currentSnap)
          .move(false);
      },
      onMount: (data) => {
        const { defaultSnap } = data;
        controller.current.setSnap(data, defaultSnap).move();
      },
    });

    React.useImperativeHandle(
      ref,
      () => ({
        snapTo: (
          index: number | "auto" | "close",
          options?: {
            animation?: boolean;
            nearest?: boolean;
          },
        ) => {
          const { animation = true, nearest = false } = options || {};
          if (!snapPoints) return;
          const snap =
            snapPoints[nearest ? "getNearestByIndex" : "getByIndex"](index);
          if (snap) {
            controller.current.setSnap(snapPoints, snap).move(animation);
          }
        },
      }),
      [snapPoints],
    );

    const modifyTarget = React.useCallback(
      (t: number) => {
        if (!snapPoints) return t;
        const snap = snapPoints.getNearestByCoord(t);
        controller.current.setSnap(snapPoints, snap);
        return snap.value;
      },
      [controller, snapPoints],
    );

    const enableScrollArea = React.useRef(false);
    const isDraggingRef = React.useRef(false);
    const dragStatusRef = React.useRef<null | number>(null);
    const dragDirectionRef = React.useRef<"up" | "down" | null>(null);
    React.useEffect(() => {
      const elem = scrollRef.current!;
      const preventScrolling = (e: Event) => {
        if (!enableScrollArea.current) e.preventDefault();
      };
      elem.addEventListener("scroll", preventScrolling);
      elem.addEventListener("touchmove", preventScrolling);
      return () => {
        elem.removeEventListener("scroll", preventScrolling);
        elem.removeEventListener("touchmove", preventScrolling);
      };
    }, [scrollRef]);

    return (
      <>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            visibility: "hidden",
          }}
          ref={containerRef}
        ></div>
        <motion.div
          id="sbs-container-area"
          dragControls={dragControls}
          drag={"y"}
          transition={{ ease: "easeOut", duration: 2 }}
          dragTransition={{
            power: 0.3,
            timeConstant: 200,
            modifyTarget,
          }}
          style={{
            y,
            width: "100%",
            position: "absolute",
            top: "100%",
          }}
          dragConstraints={
            snapPoints
              ? {
                  top: snapPoints.maxSnap.value,
                  bottom: snapPoints.minSnap.value,
                }
              : undefined
          }
        >
          <motion.div
            onPointerUpCapture={() => {
              isDraggingRef.current = false;
            }}
            onPointerDownCapture={(e) => {
              isDraggingRef.current = true;
              const yPos = e.clientY;
              dragStatusRef.current = yPos;
              dragDirectionRef.current = null;

              // firefox / safari fix
              // without this, scrollarea down -> up -> up requires additional swipe to close
              const isScrollAtTop =
                scrollRef.current &&
                controller.current.minMax === "max" &&
                scrollRef.current.scrollTop <= 0;
              if (isScrollAtTop) {
                enableScrollArea.current = false;
              }

              if (enableScrollArea.current) {
                e.stopPropagation();
              }
            }}
            onPointerMoveCapture={(e) => {
              // if not dragging return
              if (dragStatusRef.current === null) return;

              // update yPos
              const yPos = e.clientY;
              const dragDirection =
                yPos - dragStatusRef.current >= 0 ? "down" : "up";
              dragStatusRef.current = yPos;
              dragDirectionRef.current = dragDirection;

              if (!scrollRef.current) return;

              const isFullyExpanded = controller.current.minMax === "max";
              const hasScroll =
                scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
              const isScrollAtTop = scrollRef.current.scrollTop <= 0;

              // if not expanded or there is no scroll we don't need to handle
              if (!isFullyExpanded || !hasScroll) {
                enableScrollArea.current = false;
                return;
              }
              // if open but scroll not at top, enable scroll area
              if (!isScrollAtTop) {
                enableScrollArea.current = true;
                return;
              }

              // if scroll at top

              // if drag direction is down, disable scroll area
              if (dragDirectionRef.current === "down") {
                enableScrollArea.current = false;
                return;
              }
              // if drag direction is up, enable scroll area
              enableScrollArea.current = true;
            }}
            id="sbs-scroll-area"
            ref={scrollRef}
            style={{
              height: wrapperHeight,
              overflow: "auto",
              overscrollBehavior: "none",
            }}
            className={props.className}
          >
            {props.children}
          </motion.div>
        </motion.div>
      </>
    );
  },
);
InnerSlickBottomSheet.displayName = "InnerSlickBottomSheet";
