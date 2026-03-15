/**
 * Create a user account (run from project root)
 * Users can only be created via this script; no self-signup.
 *
 * Usage: npx tsx scripts/create-user.ts <email> <password> [name] [role]
 * Or:    EMAIL=admin@example.com PASSWORD=secret npx tsx scripts/create-user.ts
 *
 * Role: BRAND_ADMIN | PLAYER (default: BRAND_ADMIN)
 * Uses DATABASE_URL from .env or environment.
 */

import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMAIL ?? process.argv[2];
  const password = process.env.PASSWORD ?? process.argv[3];
  const name = process.env.NAME ?? process.argv[4] ?? null;
  const role = (process.env.ROLE ?? process.argv[5] ?? "BRAND_ADMIN") as "BRAND_ADMIN" | "PLAYER";

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <email> <password> [name] [role]");
    console.error("   Or: EMAIL=... PASSWORD=... npx tsx scripts/create-user.ts");
    console.error("   Role: BRAND_ADMIN | PLAYER (default: BRAND_ADMIN)");
    process.exit(1);
  }

  if (role !== "BRAND_ADMIN" && role !== "PLAYER") {
    console.error("Role must be BRAND_ADMIN or PLAYER");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`Error: User with email ${email} already exists.`);
    process.exit(1);
  }

  const hashed = await hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: name || null,
      role,
    },
  });

  console.log("User created successfully.");
  console.log("");
  console.log("User:");
  console.log(`  Email: ${email}`);
  console.log(`  Name: ${name ?? "(not set)"}`);
  console.log(`  Role: ${role}`);
  console.log("");
  console.log("The user can now log in at /login");
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
