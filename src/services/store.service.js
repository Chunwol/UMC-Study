import { addStoreAndDetails } from '#Repository/store.repository.js';
import { getRegionIdFromCode } from '#Repository/region.repository.js';
import CustomError from '#Middleware/error/customError.js';

//가게 생성
export const createStore = async (userId, storeData) => {
  const regionId = await getRegionIdFromCode(storeData.addressCode);
  if (!regionId) {
    throw new CustomError({ name: 'BAD_REQUEST', message: '유효하지 않은 지역 코드입니다.' });
  }
  const newStore = await addStoreAndDetails({
    coreData: {
        userId: userId,
        regionId: regionId,
        name: storeData.name,
        addressDetail: storeData.addressDetail,
        industry: storeData.industry,
    },
    photos: storeData.photoUrls,
    hours: storeData.storeHours,
  });

  return newStore;
};