// prisma.config.ts
import "dotenv/config";           // This loads your .env file
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DATABASE_URL"),     // Connection URL for Prisma CLI (migrations, db push, etc.)
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),  // optional if you use it
  },

  // Optional: configure migrations and seed
  migrations: {
    path: "prisma/migrations",
    // seed: "tsx prisma/seed.ts",   // if you have a seed script
  },
});