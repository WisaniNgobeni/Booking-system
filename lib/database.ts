import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { tandemPrisma?: PrismaClient };
export const databaseConfigured = Boolean(process.env.DATABASE_URL);
export const prisma = globalForPrisma.tandemPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.tandemPrisma = prisma;