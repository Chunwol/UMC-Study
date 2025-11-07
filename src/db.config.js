import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ["query"]});
const connect = async (exitOnError = false, verbose = false) => {
  try {
    await prisma.$connect();
    if (verbose) {
      console.log('데이터베이스와 성공적으로 연결되었습니다. (Prisma)');
    }
  } catch (err) {
    if (verbose) {
      console.error('Prisma 데이터베이스 연결에 실패했습니다:', err);
    }
    if (exitOnError) {
      process.exit(1);
    }
    throw err;
  }
};

export { prisma, connect };