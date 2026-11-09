import { PrismaClient } from '@prisma/client';

/** Một instance PrismaClient dùng chung cho toàn bộ tiến trình server. */
export const prisma = new PrismaClient();

/** Ngắt kết nối CSDL khi tiến trình dừng (Render gửi SIGTERM khi tái triển khai). */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
