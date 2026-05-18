import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // The CLI uses this URL for migrations. 
    // It should be a direct connection (non-pooling).
    url: env("DATABASE_URL_NON_POOLING") || env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
