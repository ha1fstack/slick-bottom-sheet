"use client";

import React from "react";
import {
  DraggableProps,
  Point,
  ValueAnimationTransition,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Snap, SnapPoint, useSnapPoint } from "./hooks/useSnapPoint";
import { _DragControls } from "./types";

export interface SnapConfig {
  /**
   * Initial snap when opened, provide "auto" or index of {@link SnapConfig.snaps}
   * @type {number | "auto"}
   * @default "auto"
   */
  defaultSnap?: number | "auto";
  /**
   * Whether to create auto height of content as snap.
   * If the content height is taller than container height, container height will be used instead.
   * If total number of snaps excluding close snap is 0, auto snap will be forcefully created.
   * @type {boolean}
   * @default true
   */
  useAutoSnap?: boolean;
  /**
   * Whether to create close snap that triggers close behavior when snapped to.
   * @type {boolean}
   * @default true
   */
  useCloseSnap?: boolean | number;
  /**
   * List of snaps.
   * Positive: distance from bottom.
   * <= 1: container height percentage from bottom.
   * Negative: distance from top.
   * @type {number[]}
   * @default []
   */
  snaps?: number[];
  /**
   * Whether to ignore snaps taller than auto snap.
   * @type {boolean}
   * @default true
   */
  autoSnapAsMax?: boolean;
  /**
   * Whether to ignore auto snap if auto snap is taller than any of provided snaps.
   * @type {boolean}
   * @default true
   */
  maxSnapAsMax?: boolean;
  /**
   * On snap change callback
   */
  onSnap?: (snap: SnapPoint) => void;
}

interface MotionConfig {
  /**
   * Framer transition options when animation is triggered via drag
   */
  dragTransition?: Omit<
    NonNullable<DraggableProps["dragTransition"]>,
    "modifyTarget"
  >;
  dragElastic?: number;
  /**
   * Framer transition options when animation is triggered programmatically
   */
  animationTransition?: ValueAnimationTransition<number>;
}

export interface SlickBottomSheetProps extends SnapConfig, MotionConfig {
  isOpen: boolean;
  onCloseStart?: () => void;
  onCloseEnd?: () => void;
  onOpenStart?: () => void;
  className?: string;
  children?: React.ReactNode;
  /**
   * Header to be rendered at the top of the sheet
   * @type {React.ReactNode}
   */
  header?: React.ReactNode;
  /**
   * Footer to be rendered at the bottom of the sheet
   * @type {React.ReactNode}
   */
  footer?: React.ReactNode;
  /**
   * Backdrop to be rendered behind the sheet
   * @type {React.ReactNode}
   */
  backdrop?: React.ReactNode;
  /**
   * Whether should backdrop block or passthrough pointer events
   * @type {boolean}
   * @default true
   */
  backdropBlock?: boolean;
  /**
   * Backdrop container class name
   * @type {boolean | React.ReactNode}
   */
  backdropClassName?: string;
  /**
   * Whether to close when backdrop is tapped
   * @type {boolean}
   * @default true
   */
  closeOnBackdropTap?: boolean;
}

export interface SlickBottomSheetControl {
  snapTo: (
    index: number | "auto" | "close" | "default",
    options?: {
      animation?: boolean;
      nearest?: boolean;
    },
  ) => void;
}

interface InnerSlickBottomSheetProps
  extends Omit<SlickBottomSheetProps, "isOpen"> {}

export const SlickBottomSheet = React.forwardRef<
  SlickBottomSheetControl,
  SlickBottomSheetProps
>(
  (
    {
      isOpen,
      onOpenStart,
      onCloseEnd,
      closeOnBackdropTap = true,
      backdropBlock = true,
      children,
      ...props
    },
    ref,
  ) => {
    const [mounted, setMounted] = React.useState(false);
    const timerRef = React.useRef<ReturnType<typeof requestAnimationFrame>>();
    const isInitialOpenRef = React.useRef<boolean>(isOpen);

    React.useLayoutEffect(() => {
      if (isOpen) {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        setMounted(true);
        if (mounted && ref && "current" in ref) ref?.current?.snapTo("default");
        return () => {
          isInitialOpenRef.current = false;
        };
      }
    }, [isOpen, mounted, ref]);

    const handleOpenStart = React.useCallback(async () => {
      await onOpenStart?.();
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    }, [onOpenStart]);

    const handleCloseEnd = React.useCallback(async () => {
      await onCloseEnd?.();
      timerRef.current = requestAnimationFrame(() => {
        setMounted(false);
      });
    }, [onCloseEnd]);

    if (!mounted) return null;

    return (
      <InnerSlickBottomSheet
        onOpenStart={handleOpenStart}
        onCloseEnd={handleCloseEnd}
        ref={ref}
        backdropBlock={backdropBlock}
        closeOnBackdropTap={closeOnBackdropTap}
        {...props}
      >
        {children}
      </InnerSlickBottomSheet>
    );
  },
);
SlickBottomSheet.displayName = "SlickBottomSheet";

const InnerSlickBottomSheet = React.forwardRef<
  SlickBottomSheetControl,
  InnerSlickBottomSheetProps
>((props: InnerSlickBottomSheetProps, ref) => {
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const yVelocity = useVelocity(y);
  const wrapperHeight = useTransform(y, (v) => Math.abs(v));

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  const controller = React.useRef<{
    currentSnap: null | SnapPoint;
    minMax: "min" | "max" | null;
    snapTo: (
      data: Snap,
      target: string | number | SnapPoint,
    ) => {
      move: (animation?: boolean) => void;
    };
    handleMinMax: (to: "min" | "max" | null) => void;
  }>({
    currentSnap: null,
    minMax: null,
    snapTo(data: Snap, target: string | number | SnapPoint) {
      const snap = data.getNearestByIndex(
        typeof target === "string" || typeof target === "number"
          ? target
          : target.index,
      );
      this.currentSnap = snap;

      props.onSnap?.(snap);

      if (snap.index === "close") {
        props.onCloseStart?.();
        if (props.backdropBlock && containerRef.current) {
          containerRef.current.style.pointerEvents = "none";
        }
      } else {
        if (props.backdropBlock && containerRef.current) {
          containerRef.current.style.removeProperty("pointer-events");
        }
      }

      return {
        move: (animation = true) => {
          animate(y, snap.value, {
            ...props.animationTransition,
            duration: animation ? props.animationTransition?.duration : 0,
          });
        },
      };
    },
    handleMinMax(to: "min" | "max" | null) {
      this.minMax = to;
    },
  });

  useMotionValueEvent(yVelocity, "change", () => {
    if (!snapPoints) return;

    const position = y.get();

    const closePosition = snapPoints.getByIndex("close")?.value;
    if (closePosition !== undefined && position >= closePosition) {
      props.onCloseEnd?.();
      return;
    }

    if (position - snapPoints.maxSnap.value <= 30) {
      controller.current.handleMinMax("max");
    } else if (position - snapPoints.minSnap.value > -30) {
      controller.current.handleMinMax("min");
    } else {
      controller.current.handleMinMax(null);
    }
  });

  const snapPoints = useSnapPoint({
    containerRef,
    contentRef: contentRef,
    headerRef,
    footerRef,
    config: {
      snaps: props.snaps,
      defaultSnap: props.defaultSnap,
      useAutoSnap: props.useAutoSnap,
      autoSnapAsMax: props.autoSnapAsMax,
      maxSnapAsMax: props.maxSnapAsMax,
      useCloseSnap: props.useCloseSnap,
    },
    onChange: (data) => {
      if (!controller.current.currentSnap) {
        return;
      }
      controller.current
        .snapTo(data, controller.current.currentSnap)
        .move(false);
    },
    onMount: async (data) => {
      const { defaultSnap } = data;
      await props.onOpenStart?.();
      controller.current.snapTo(data, defaultSnap).move();
    },
  });

  React.useImperativeHandle<unknown, SlickBottomSheetControl>(
    ref,
    () => ({
      snapTo: (index, options) => {
        const { animation = true, nearest = false } = options || {};
        if (!snapPoints) return;
        const snap =
          index === "default"
            ? snapPoints.defaultSnap
            : snapPoints[nearest ? "getNearestByIndex" : "getByIndex"](index);
        if (snap) {
          controller.current.snapTo(snapPoints, snap).move(animation);
        }
      },
    }),
    [snapPoints],
  );

  const modifyTarget = React.useCallback(
    (t: number) => {
      if (!snapPoints) return t;
      const snap = snapPoints.getNearestByCoord(t);
      controller.current.snapTo(snapPoints, snap);
      return snap.value;
    },
    [controller, snapPoints],
  );

  const enableContentScroll = React.useRef(false);
  React.useEffect(() => {
    const elem = contentRef.current!;
    const preventScrolling = (e: Event) => {
      if (!enableContentScroll.current) e.preventDefault();
    };
    elem.addEventListener("scroll", preventScrolling);
    elem.addEventListener("touchmove", preventScrolling);
    return () => {
      elem.removeEventListener("scroll", preventScrolling);
      elem.removeEventListener("touchmove", preventScrolling);
    };
  }, [contentRef]);

  const pointerDownRef = React.useRef<boolean>(false);
  const clientYRef = React.useRef<number | null>(null);

  const onPointerDown = React.useCallback<React.PointerEventHandler>(
    (e) => {
      pointerDownRef.current = true;
      if (contentRef.current) {
        enableContentScroll.current = false;
      }
      clientYRef.current = e.clientY;

      if (!snapPoints?.isScroll) {
        dragControls.start(e);
        return;
      }

      if (controller.current.minMax !== "max") {
        dragControls.start(e);
      }
    },
    [dragControls, snapPoints],
  );

  const onPointerMove = React.useCallback<React.PointerEventHandler>(
    (e) => {
      if (!snapPoints?.isScroll || !pointerDownRef.current) {
        return;
      }

      const elementControlIteratorResult = (
        dragControls as unknown as _DragControls
      ).componentControls
        .values()
        .next();
      if (elementControlIteratorResult.done) return;
      const elementControl = elementControlIteratorResult.value;

      if (!clientYRef.current) return;

      // max or not
      if (controller.current.minMax === "max") {
        // if direction is down and content scroll is at top
        if (
          clientYRef.current <= e.clientY &&
          scrollRef.current?.scrollTop === 0
        ) {
          if (!elementControl.panSession) {
            dragControls.start(e);
          }
        } else {
          enableContentScroll.current = true;
        }
      } else {
        enableContentScroll.current = false;
      }

      if (!elementControl.isDragging) {
        clientYRef.current = e.clientY;
      }
    },
    [dragControls, snapPoints],
  );

  const onPointerUp = React.useCallback(() => {
    pointerDownRef.current = false;
  }, []);

  const opacity = useTransform(
    y,
    [
      0,
      snapPoints?.processedMap["close"] !== undefined
        ? Math.max(
            snapPoints.minSnapExceptClose.value,
            -snapPoints.containerHeight * 0.25,
          )
        : 0,
    ],
    [0, 1],
  );

  return (
    <>
      <motion.div
        data-sbs-backdrop
        onTap={() => {
          if (props.closeOnBackdropTap && snapPoints) {
            controller.current.snapTo(snapPoints, "close").move();
          }
        }}
        onPointerDownCapture={onPointerDown}
        onPointerMoveCapture={onPointerMove}
        onPointerUpCapture={onPointerUp}
        style={{
          position: "absolute",
          inset: 0,
          userSelect: "none",
          touchAction: "pan-x",
          pointerEvents: "none",
          opacity,
        }}
        className={props.backdropClassName}
        ref={containerRef}
      >
        {props.backdrop}
      </motion.div>
      <motion.div
        data-sbs-container
        onPointerDownCapture={onPointerDown}
        onPointerMoveCapture={onPointerMove}
        onPointerUpCapture={onPointerUp}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            if (snapPoints) {
              controller.current.snapTo(snapPoints, "close").move();
            }
          }
        }}
        onDragEnd={onPointerUp}
        dragListener={false}
        dragControls={dragControls}
        drag="y"
        dragTransition={{
          power: 0.3,
          timeConstant: 75,
          restDelta: 0.1,
          ...props.dragTransition,
          modifyTarget,
        }}
        style={{
          y,
          width: "100%",
          position: "absolute",
          top: "100%",
          touchAction: "pan-x",
          opacity,
          userSelect: "none",
        }}
        dragElastic={{
          top: props.dragElastic ?? 0.5,
          bottom: 0,
        }}
        dragConstraints={
          snapPoints
            ? {
                top: snapPoints.maxSnap.value,
                bottom: snapPoints.minSnap.value,
              }
            : undefined
        }
        className={props.className}
      >
        <motion.div
          data-sbs-wrapper
          style={{
            display: "flex",
            flexDirection: "column",
            height: wrapperHeight,
          }}
        >
          {props.header && (
            <div data-sbs-header ref={headerRef}>
              {props.header}
            </div>
          )}
          <div
            data-sbs-scroll
            ref={scrollRef}
            style={{
              flexGrow: 1,
              overflow: "auto",
              overscrollBehavior: "none",
            }}
          >
            <div data-sbs-content ref={contentRef}>
              {props.children}
            </div>
          </div>
          {props.footer && (
            <div data-sbs-footer ref={footerRef}>
              {props.footer}
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
});
InnerSlickBottomSheet.displayName = "InnerSlickBottomSheet";
