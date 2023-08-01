export function getClosestIndexAndValue(
  arr: number[],
  target: number,
): {
  value: number;
  index: number;
} {
  let closestValue = arr[0];
  let closestIndex = 0;
  let minDifference = Math.abs(target - arr[0]);

  for (let i = 1; i < arr.length; i++) {
    const currentDifference = Math.abs(target - arr[i]);
    if (currentDifference < minDifference) {
      minDifference = currentDifference;
      closestValue = arr[i];
      closestIndex = i;
    }
  }

  return {
    value: closestValue,
    index: closestIndex,
  };
}
