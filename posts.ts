import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

/**
 *
 * Similates a page viewing a bunch of posts that are cached with a TTL of 300 seconds.
 */
async function postsView(requestsCount: number) {
  for (let i = 0; i < requestsCount; i++) {
    const startTime = performance.now();
    const { info } = await prisma.post
      .findMany({
        cacheStrategy: {
          ttl: 300,
          tags: ["posts"], // <--- This is how you tag a query to be cached
        },
      })
      .withAccelerateInfo();
    const duration = performance.now() - startTime;

    console.log(
      `Query ${i + 1}: ${duration.toFixed(2)}ms - Cache Status: ${
        info?.cacheStatus || "unknown"
      }`
    );
  }
}

/**
 *
 * Similates how one would invalidate the cache for a given tag.
 */
async function postsEditView() {
  await prisma.$accelerate.invalidate({
    tags: ["posts"], // <--- Notice that this tag is the same as the one used in the view function
  });

  console.log("Invalidated cache for all posts view");
}

async function main() {
  const args = process.argv.slice(2);
  const operation = args[0];
  const requestsCount = 50; // You can change this to any number you want

  switch (operation) {
    case "view":
      console.log(`Starting load test with ${requestsCount} requests`);

      const startTime = Date.now();
      await postsView(requestsCount);
      const endTime = Date.now();

      console.log(`\nTotal execution time: ${endTime - startTime}ms`);

      break;
    case "edit":
      await postsEditView();
      break;
    default:
      console.error('Invalid operation. Use "view" or "edit".');
      process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
