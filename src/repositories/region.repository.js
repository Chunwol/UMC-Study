import { prisma } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';

//법정동 코드로 ID검색
export const getRegionIdFromCode = async (addressCode, txClient) => {
  const client = txClient || prisma;
  
  const normalizedCode = addressCode.substring(0, 8) + '00';

  try {
    const region = await client.region.findFirst({
      where: {
        code: normalizedCode,
      },
      select: {
        id: true,
      },
    });
    return region ? region.id : null;

  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};