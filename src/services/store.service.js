import { getProfileIdFromUserId } from '#Repository/user.repository.js';
import { addStoreAndDetails } from '#Repository/store.repository.js';
import { getRegionIdFromCode } from '#Repository/region.repository.js';
import { addReviewAndPhotos } from '#Repository/review.repository.js';
import { addMission, addUserMission } from '#Repository/mission.repository.js';
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

//가게 리뷰 생성
export const createReview = async (userId, storeId, reviewData) => {
    const profileId = await getProfileIdFromUserId(userId);
    if (!profileId) {
        throw new CustomError({ name: 'BAD_REQUEST', message: '리뷰를 작성할 프로필이 존재하지 않습니다.'});
    }

    const newReview = await addReviewAndPhotos({
        reviewCoreData: {
            profile_id: profileId,
            store_id: storeId,
            star_rating: reviewData.star_rating,
            content: reviewData.content
        },
        photos: reviewData.photoUrls
    });

    return newReview;
};