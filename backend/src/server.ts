import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    const server = app.listen(env.PORT, () => {
      console.log(
        `LuxeVerse API running at http://localhost:${env.PORT}`
      );
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        await prisma.$disconnect();
        console.log("Server stopped");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

void startServer();