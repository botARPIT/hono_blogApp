
import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

let prisma: ReturnType<typeof createPrismaClient>;
export const Version = Prisma.prismaVersion.client;
function createPrismaClient(dbUrl: string) {
  return new PrismaClient({ 
    datasources: { db: { url: dbUrl } } 
  }).$extends(withAccelerate());
}

export function getPrismaClient(dbUrl: string) {
  if (!prisma) {
    prisma = createPrismaClient(dbUrl);
  } else 
   prisma.$connect().catch(console.error);
  return prisma;
}