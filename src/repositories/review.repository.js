import { prisma } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';
import { updateStoreStarRating } from '#Repository/store.repository.js';

//리뷰와 사진 작성
export const addReviewAndPhotos = async (data) => {
    const { reviewCoreData, photos } = data;

    try {
        const newReview = await prisma.$transaction(async (tx) => {
            
            const createdReview = await tx.storeReview.create({
                data: {
                    profileId: reviewCoreData.profile_id,
                    storeId: reviewCoreData.store_id,
                    starRating: reviewCoreData.star_rating,
                    content: reviewCoreData.content
                }
            });

            if (photos && photos.length > 0) {
                const photoData = photos.map(link => ({
                    reviewId: createdReview.id,
                    link: link
                }));

                await tx.reviewPhoto.createMany({
                    data: photoData
                });
            }

            await updateStoreStarRating(createdReview.storeId, tx);

            return createdReview;
        });

        return newReview;

    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};