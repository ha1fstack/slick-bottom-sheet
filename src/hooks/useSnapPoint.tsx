import React from "react";
import { SnapConfig } from "src";
import { getClosestIndexAndValue } from "../utils";

export interface SnapPoint {
  value: number;
  index: string;
}

export type Snap = {
  getByIndex: (index: string | number, fallback?: boolean) => SnapPoint | null;
  getNearestByCoord: (coord: number) => SnapPoint;
  getNearestByIndex: (index: string | number) => SnapPoint;
  defaultSnap: SnapPoint;
  autoSnap: SnapPoint;
  minSnap: SnapPoint;
  minSnapExceptClose: SnapPoint;
  maxSnap: SnapPoint;
  originalMap: Record<string | number, number>;
  processedMap: Record<string | number, number>;
};

export function useSnapPoint<T extends HTMLElement>({
  containerRect,
  contentRef,
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
  containerRect: DOMRect | null;
  contentRef: React.RefObject<T>;
  config: SnapConfig;
  onMount?: (snapPoints: NonNullable<ReturnType<typeof useSnapPoint>>) => void;
  onChange?: (snapPoints: NonNullable<ReturnType<typeof useSnapPoint>>) => void;
}): null | Snap {
  const mount = React.useRef(false);

  const snapPoints = React.useMemo(() => {
    if (!containerRect || !contentRef.current) return null;

    const containerHeight = containerRect.height;
    const scrollHeight = contentRef.current.scrollHeight;

    const originalMap: Record<string | number, number> = {};

    snaps.forEach((value, key) => {
      if (value <= 1) originalMap[key] = -value * containerHeight;
      else originalMap[key] = -value;
    });
    if (useCloseSnap || useCloseSnap === 0) {
      if (useCloseSnap === true) {
        originalMap["close"] = 0;
      } else {
        originalMap["close"] = -useCloseSnap;
      }
    }
    if (useAutoSnap) {
      originalMap["auto"] = -scrollHeight;
    }

    let processedKeys = Object.keys(originalMap);
    if (autoSnapAsMax) {
      processedKeys = processedKeys.filter((key) => {
        const value = originalMap[key];
        return value >= -scrollHeight;
      });
    }
    processedKeys = processedKeys.filter(
      (key) => originalMap[key] >= -containerHeight,
    );

    const processedMap = processedKeys.reduce<Record<string | number, number>>(
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

    const autoSnap: SnapPoint = getNearestByIndex("auto");
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

    const result = {
      getByIndex,
      getNearestByCoord,
      getNearestByIndex,
      defaultSnap: _defaultSnap,
      autoSnap,
      minSnap,
      minSnapExceptClose,
      maxSnap,
      originalMap,
      processedMap,
    };

    if (!mount.current) {
      mount.current = true;
      if (onMount) onMount(result);
    } else {
      if (onChange) onChange(result);
    }

    return result;
  }, [
    autoSnapAsMax,
    containerRect,
    contentRef,
    defaultSnap,
    onChange,
    onMount,
    snaps,
    useAutoSnap,
    useCloseSnap,
  ]);

  return snapPoints;
}
