import { prisma } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';
import { Prisma } from '@prisma/client';

//가게 생성
export const addStoreAndDetails = async (data) => {
  const { coreData, photos, hours } = data;

  try {
    const newStore = await prisma.$transaction(async (tx) => {
      
      const createdStore = await tx.store.create({
        data: {
          userId: coreData.userId,
          regionId: coreData.regionId,
          name: coreData.name,
          industry: coreData.industry,
          addressDetail: coreData.addressDetail
        }
      });

      if (photos && photos.length > 0) {
        const photoData = photos.map(link => ({
          storeId: createdStore.id,
          link: link
        }));
        await tx.storePhoto.createMany({
          data: photoData
        });
      }

      if (hours && hours.length > 0) {
        const hourData = hours.map(h => ({
          storeId: createdStore.id,
          dayOfWeek: h.day_of_week,
          openTime: new Date(`1970-01-01T${h.open_time}:00Z`),
          closeTime: new Date(`1970-01-01T${h.close_time}:00Z`)
        }));
        await tx.storeHours.createMany({
          data: hourData
        });
      }
      
      return createdStore;
    });
    
    return newStore;

  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new CustomError({ name: 'BAD_REQUEST', message: '해당 사용자는 이미 가게를 등록했습니다.' });
    }
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};

//가게 존재여부 확인
export const isStoreExist = async (storeId) => {
  try {
    const count = await prisma.store.count({
      where: { id: parseInt(storeId, 10) }
    });
    return count > 0;
  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
};

//유저ID로 가게ID검색
export const getOwnerIdFromStoreId = async (storeId) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: parseInt(storeId, 10) },
      select: { userId: true }
    });
    return store ? store.userId : null;
  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }
}

//별점 매기기
export const updateStoreStarRating = async (storeId, txClient) => {
  const client = txClient || prisma;
  try {
    await client.$executeRaw(
      Prisma.sql`UPDATE store s
                 SET s.star_rating = COALESCE((SELECT AVG(sr.star_rating) FROM store_review sr WHERE sr.store_id = s.id), 0.0)
                 WHERE s.id = ${storeId};`
    );
  } catch (err) {
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR', message: '가게 별점 업데이트 중 오류가 발생했습니다.' });
  }
};