function getPercentile(numbers: number[], percentile: number): number {
  if (percentile <= 0 || percentile >= 100) {
    throw new Error("Percentile must be between 0 and 100.");
  }

  const index = (percentile / 100) * (numbers.length - 1);
  if (Number.isInteger(index)) {
    // If the index is an integer, return the corresponding value
    return numbers[index];
  } else {
    // If the index is not an integer, interpolate between two adjacent values
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const lowerValue = numbers[lowerIndex];
    const upperValue = numbers[upperIndex];
    const interpolationFactor = index - lowerIndex;
    return lowerValue + (upperValue - lowerValue) * interpolationFactor;
  }
}

export function calculateStatistics(numbers: number[]): {
  average: number;
  p50: number;
  p75: number;
  p99: number;
} {
  if (numbers.length === 0) {
    throw new Error("The input array is empty.");
  }

  // Sort the array in ascending order
  numbers.sort((a, b) => a - b);

  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const count = numbers.length;

  const average = sum / count;
  const p50 = getPercentile(numbers, 50);
  const p75 = getPercentile(numbers, 75);
  const p99 = getPercentile(numbers, 99);

  return { average, p50, p75, p99 };
}