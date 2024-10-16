import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PrismaQuery(
  callback: (prisma: PrismaClient) => Promise<void>
) {
  return callback(prisma).then(async () => await prisma.$disconnect());
}
