import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

interface TestResult {
  index: number;
  duration: number;
  cacheStatus: string | undefined;
}

async function runLoadTest(requestsCount: number, chunkSize: number) {
  let totalTime = 0;
  const results: TestResult[] = [];

  const queryWithInfo = async (index: number): Promise<TestResult> => {
    const startTime = performance.now();
    const { info } = await prisma.post
      .findMany({
        cacheStrategy: { ttl: 30, swr: 60 },
      })
      .withAccelerateInfo();
    const duration = performance.now() - startTime;
    totalTime += duration;
    return {
      index,
      duration,
      cacheStatus: info?.cacheStatus,
    };
  };

  for (let i = 0; i < requestsCount; i += chunkSize) {
    const promises = Array.from({ length: Math.min(chunkSize, requestsCount - i) }, (_, j) =>
      queryWithInfo(i + j)
    );

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);

    // Log progress
    console.log(`Completed ${Math.min(i + chunkSize, requestsCount)}/${requestsCount} requests`);
  }

  return { results, totalTime };
}

function analyzeResults(results: TestResult[], totalTime: number) {
  const requestsCount = results.length;
  const averageTime = totalTime / requestsCount;
  
  const sortedDurations = results.map(r => r.duration).sort((a, b) => a - b);
  const median = sortedDurations[Math.floor(requestsCount / 2)];
  const p95 = sortedDurations[Math.floor(requestsCount * 0.95)];
  const p99 = sortedDurations[Math.floor(requestsCount * 0.99)];

  const cacheStatusCounts = results.reduce((acc, result) => {
    acc[result.cacheStatus || 'unknown'] = (acc[result.cacheStatus || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\nLoad Test Results:");
  console.log(`Total Requests: ${requestsCount}`);
  console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average Request Time: ${averageTime.toFixed(2)}ms`);
  console.log(`Median Request Time: ${median.toFixed(2)}ms`);
  console.log(`95th Percentile: ${p95.toFixed(2)}ms`);
  console.log(`99th Percentile: ${p99.toFixed(2)}ms`);
  console.log("\nCache Status Distribution:");
  Object.entries(cacheStatusCounts).forEach(([status, count]) => {
    console.log(`${status}: ${count} (${((count / requestsCount) * 100).toFixed(2)}%)`);
  });
}

async function main() {
  const requestsCount = 5000;
  const chunkSize = 100;

  console.log(`Starting load test with ${requestsCount} requests in chunks of ${chunkSize}`);

  const startTime = Date.now();
  const { results, totalTime } = await runLoadTest(requestsCount, chunkSize);
  const endTime = Date.now();

  analyzeResults(results, totalTime);

  console.log(`\nTotal execution time: ${endTime - startTime}ms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });