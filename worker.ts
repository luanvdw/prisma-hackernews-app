import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

async function runQueries(numRequests: number) {
  const timings: number[] = [];

  for (let i = 0; i < numRequests; i++) {
    const start = Date.now();
    await prisma.post.findMany({ take: 20, cacheStrategy: { ttl: 60 } });
    timings.push(Date.now() - start);
  }

  return timings;
}

async function main() {
  const numRequests = parseInt(process.argv[2], 10);
  const timings = await runQueries(numRequests);
  console.log(JSON.stringify(timings));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
