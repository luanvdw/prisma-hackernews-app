import { spawn } from 'child_process';
import { calculateStatistics } from './utils';

const NUM_PROCESSES = 20; // Simulate concurrent serverless functions
const REQUESTS_PER_PROCESS = 1; // The number of request each serverless function will make
const NUM_RUNS = 3;

async function runSingleBenchmark() {
  const allTimings: number[] = [];

  const processes = Array(NUM_PROCESSES).fill(null).map(() => {
    return new Promise<number[]>((resolve) => {
      const worker = spawn('npx', ['ts-node', 'worker.ts', REQUESTS_PER_PROCESS.toString()]);
      let output = '';

      worker.stdout.on('data', (data) => {
        output += data.toString();
      });

      worker.on('close', () => {
        const timings = JSON.parse(output);
        resolve(timings);
      });
    });
  });

  const results = await Promise.all(processes);
  results.forEach(timings => allTimings.push(...timings));

  return allTimings
}

async function runBenchmark() {
  for (let i = 1; i <= NUM_RUNS; i++) {
    console.log(`Running benchmark - Round ${i}...`);
    const allTimings = await runSingleBenchmark();

    const statistics = calculateStatistics(allTimings);
    console.log(`Round ${i} Statistics:`);
    console.log('Total Requests:', allTimings.length);
    console.log('Average (ms):', statistics.average.toFixed(2));
    console.log('P50 (ms):', statistics.p50.toFixed(2));
    console.log('P75 (ms):', statistics.p75.toFixed(2));
    console.log('P99 (ms):', statistics.p99.toFixed(2));
    console.log('-------------------');
  }

  console.log('Benchmark completed.');
}

runBenchmark().catch(console.error);