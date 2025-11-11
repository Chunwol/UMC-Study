import { getProfileIdFromUserId } from '#Repository/user.repository.js';
import { getReviewsByProfileId, getReviewsByStoreId, addReviewAndPhotos } from "#Repository/review.repository.js";

//가게 리뷰 목록 조회
export const getStoreReviews = async (storeId, cursor, requestedLimit, sortBy) => {
    
    let finalLimit = requestedLimit || 10;
    if (finalLimit > 30) {
        finalLimit = 30;
    }
    const reviews = await getReviewsByStoreId(storeId, cursor, finalLimit, sortBy);

    let nextCursor = null;
    if (reviews.length === finalLimit) {
        const lastReview = reviews[reviews.length - 1];
        if (sortBy === 'rating') {
            nextCursor = `${lastReview.starRating}_${lastReview.id}`;
        } else {
            nextCursor = Number(lastReview.id);
        }
        console.log("Next Cursor: "+nextCursor);
    }
    return { reviews, nextCursor, limit: finalLimit };
};

//내가 작성한 리뷰 목록 조회
export const getMyReviews = async (userId, cursor, requestedLimit) => {

    const profileId = await getProfileIdFromUserId(userId);
    if (!profileId) {
        return { reviews: [], nextCursor: null, limit: requestedLimit || 10 }; 
    }

    let finalLimit = requestedLimit || 10;
    if (finalLimit > 30) {
        finalLimit = 30;
    }

    const reviews = await getReviewsByProfileId(profileId, cursor, finalLimit);

    let nextCursor = null;
    if (reviews.length === finalLimit) {
        const lastReview = reviews[reviews.length - 1];
        nextCursor = Number(lastReview.id);
    }
    
    return { reviews, nextCursor, limit: finalLimit };
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