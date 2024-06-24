import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// const prisma = new PrismaClient().$extends(withAccelerate());
const prisma = new PrismaClient()

async function runQueries(numRequests: number) {
  const timings: number[] = [];

  for (let i = 0; i < numRequests; i++) {
    const start = Date.now();
    await prisma.post.findMany({ take: 20 });
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
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
