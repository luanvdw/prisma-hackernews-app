import { spawn } from 'child_process';
import { calculateStatistics } from './utils';

const NUM_PROCESSES = 10; // Simulate concurrent serverless functions
const REQUESTS_PER_PROCESS = 1; // The number of request each serverless function will make

async function runBenchmark() {
  console.log('Running benchmark...');
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

  const statistics = calculateStatistics(allTimings);
  console.log('Overall Statistics:');
  console.log('Total Requests:', allTimings.length);
  console.log('Average (ms):', statistics.average.toFixed(2));
  console.log('P50 (ms):', statistics.p50.toFixed(2));
  console.log('P75 (ms):', statistics.p75.toFixed(2));
  console.log('P99 (ms):', statistics.p99.toFixed(2));
}

runBenchmark().catch(console.error);