import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  const connectionString = process.env.DATABASE_URL_NON_POOLING || process.env.DATABASE_URL;
  console.log("Using connection string:", connectionString?.replace(/:.*@/, ":****@"));
  
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash("Disekolah@5474", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "steam.angga@gmail.com" },
    update: {
      name: "Purwana Abdi Pujangga",
      passwordHash: passwordHash,
      role: "TEACHER",
    },
    create: {
      email: "steam.angga@gmail.com",
      name: "Purwana Abdi Pujangga",
      passwordHash: passwordHash,
      role: "TEACHER",
    },
  });

  console.log("Teacher account created/updated:", admin.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
