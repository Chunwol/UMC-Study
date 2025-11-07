import { prisma } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';
import { updateStoreStarRating } from '#Repository/store.repository.js';

//특정 가게의 리뷰 목록 조회
export const getReviewsByStoreId = async (storeId, cursor, limit, sortBy) => {
    try {
        let whereConditions = { storeId: storeId };
        let orderByConditions = [];

        if (sortBy === 'rating') {
            orderByConditions = [
                { starRating: 'desc' },
                { id: 'desc' }
            ];

            if (cursor) {
                const [lastRating, lastId] = cursor.split('_').map(Number);
                whereConditions.OR = [
                    {
                        starRating: { lt: lastRating }
                    },
                    {
                        starRating: lastRating,
                        id: { lt: lastId }
                    }
                ];
            }
        } else {
            orderByConditions = { id: 'desc' };

            if (cursor) {
                whereConditions.id = { lt: Number(cursor) };
            }
        }

        const reviews = await prisma.storeReview.findMany({
            where: whereConditions,
            include: {
                profile: { select: { nickname: true } },
                photos: { select: { link: true } }
            },
            orderBy: orderByConditions,
            take: limit
        });
        
        return reviews;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

//특정 프로필의 리뷰 목록 조회
export const getReviewsByProfileId = async (profileId, cursor, limit) => {
    try {
        let whereConditions = {
            profileId: profileId
        };

        if (cursor) {
            whereConditions.id = { lt: Number(cursor) };
        }

        const reviews = await prisma.storeReview.findMany({
            where: whereConditions,
            include: {
                store: {
                    select: { name: true }
                },
                photos: { 
                    select: { link: true } 
                }
            },
            orderBy: {
                id: 'desc'
            },
            take: limit
        });
        
        return reviews;

    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    }
};

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