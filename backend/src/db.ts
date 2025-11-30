import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

prisma
  .$connect()
  .then(() => console.log("PostgreSQL холбогдлоо!"))
  .catch((err: Error) => console.error("PostgreSQL холболт амжилтгүй:", err));
