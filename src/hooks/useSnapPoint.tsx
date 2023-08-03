import React from "react";
import { SnapConfig } from "src";
import { getClosestIndexAndValue } from "../utils";
import { useRect } from "./useRect";

export interface SnapPoint {
  value: number;
  index: string;
}

export type Snap = {
  getByIndex: (index: string | number, fallback?: boolean) => SnapPoint | null;
  getNearestByCoord: (coord: number) => SnapPoint;
  getNearestByIndex: (index: string | number) => SnapPoint;
  defaultSnap: SnapPoint;
  // autoSnap: SnapPoint;
  minSnap: SnapPoint;
  minSnapExceptClose: SnapPoint;
  maxSnap: SnapPoint;
  originalMap: Record<string | number, number>;
  processedMap: Record<string | number, number>;
  isScroll: boolean;
};

export function useSnapPoint<T extends HTMLElement>({
  containerRef,
  contentRef,
  headerRef,
  footerRef,
  config: {
    snaps = [],
    defaultSnap = "auto",
    useAutoSnap = true,
    autoSnapAsMax = true,
    useCloseSnap = true,
  },
  onMount,
  onChange,
}: {
  containerRef: React.RefObject<T>;
  contentRef: React.RefObject<T>;
  headerRef: React.RefObject<T>;
  footerRef: React.RefObject<T>;
  config: SnapConfig;
  onMount?: (snapPoints: NonNullable<ReturnType<typeof useSnapPoint>>) => void;
  onChange?: (snapPoints: NonNullable<ReturnType<typeof useSnapPoint>>) => void;
}): null | Snap {
  const mount = React.useRef<null | Record<string, number>>(null);
  const containerRect = useRect(containerRef);
  useRect(contentRef);
  useRect(headerRef);
  useRect(footerRef);

  const snapPoints = React.useMemo(() => {
    if (!containerRect || !contentRef.current) return null;

    const containerHeight = containerRect.height;
    const contentTotalHeight =
      contentRef.current.scrollHeight +
      (headerRef?.current?.offsetHeight ?? 0) +
      (footerRef?.current?.offsetHeight ?? 0);

    const originalMap: Record<string, number> = {};

    // create original map

    snaps.forEach((value, key) => {
      if (value <= 1) originalMap[key] = -value * containerHeight;
      else originalMap[key] = -value;
    });
    if (useCloseSnap === true) {
      originalMap["close"] = 0;
    }
    if (typeof useCloseSnap === "number") {
      originalMap["close"] = -useCloseSnap;
    }
    if (useAutoSnap === true) {
      originalMap["auto"] = -contentTotalHeight;
    }

    // pick processed keys that are in range

    let processedKeys = Object.keys(originalMap);
    if (autoSnapAsMax === true) {
      processedKeys = processedKeys.filter((key) => {
        const value = originalMap[key];
        return value >= -contentTotalHeight;
      });
    }
    processedKeys = processedKeys.filter(
      (key) => originalMap[key] >= -containerHeight,
    );
    if (useCloseSnap !== undefined) {
      processedKeys = processedKeys.filter(
        (key) => key === "close" || originalMap[key] < originalMap["close"],
      );
    }

    const processedMap = processedKeys.reduce<Record<string, number>>(
      (prev, curr) => {
        prev[curr] = originalMap[curr];
        return prev;
      },
      {},
    );
    const processedValues = Object.values(processedMap);

    function getByIndex(index: string | number): SnapPoint | null {
      index = index.toString();
      const found = processedMap[index];
      if (found !== undefined) {
        return {
          value: found,
          index,
        };
      }
      return null;
    }

    function getNearestByCoord(coord: number): SnapPoint {
      const { value, index } = getClosestIndexAndValue(processedValues, coord);
      return {
        value,
        index: processedKeys[index],
      };
    }

    function getNearestByIndex(index: string | number): SnapPoint {
      index = index.toString();
      const found = processedMap[index];
      if (found !== undefined) {
        return {
          value: found,
          index,
        };
      }

      const value = originalMap[index];
      if (!value) throw Error(`invalid snap point index ${value}`);
      return getNearestByCoord(value);
    }

    const _defaultSnap: SnapPoint = (() => {
      if (defaultSnap === "auto" || defaultSnap === undefined) {
        return getNearestByIndex("auto");
      } else {
        return getNearestByIndex(defaultSnap);
      }
    })();

    // const autoSnap: SnapPoint = getNearestByIndex("auto");
    const minSnap: SnapPoint = getNearestByCoord(Math.max(...processedValues));
    const maxSnap: SnapPoint = getNearestByCoord(Math.min(...processedValues));
    const minSnapExceptClose: SnapPoint = (() => {
      if (minSnap.index === "close") {
        const sorted = [...processedValues].sort((a, b) => b - a);
        const second = sorted[1];
        return getNearestByCoord(second);
      }
      return minSnap;
    })();

    const isScroll =
      originalMap["auto"] !== undefined
        ? maxSnap.value > originalMap["auto"]
        : false;

    const result = {
      getByIndex,
      getNearestByCoord,
      getNearestByIndex,
      defaultSnap: _defaultSnap,
      // autoSnap,
      minSnap,
      minSnapExceptClose,
      maxSnap,
      originalMap,
      processedMap,
      isScroll,
    };

    if (!mount.current) {
      if (onMount) onMount(result);
    } else {
      if (
        onChange &&
        Object.entries(processedMap).toString() !==
          Object.entries(mount.current).toString()
      ) {
        onChange(result);
      }
    }
    mount.current = processedMap;

    return result;
  }, [
    autoSnapAsMax,
    containerRect,
    contentRef,
    defaultSnap,
    footerRef,
    headerRef,
    onChange,
    onMount,
    snaps,
    useAutoSnap,
    useCloseSnap,
  ]);

  return snapPoints;
}
