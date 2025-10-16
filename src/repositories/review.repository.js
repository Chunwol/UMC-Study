import { pool } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';
import { updateStoreStarRating } from '#Repository/store.repository.js';

//리뷰와 사진 작성
export const addReviewAndPhotos = async (data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const { reviewCoreData, photos } = data;
        
        const [reviewResult] = await conn.query(
            `INSERT INTO store_review (profile_id, store_id, star_rating, content) VALUES (?, ?, ?, ?);`,
            [
                reviewCoreData.profile_id,
                reviewCoreData.store_id,
                reviewCoreData.star_rating,
                reviewCoreData.content
            ]
        );
        const newReviewId = reviewResult.insertId;

        if (photos && photos.length > 0) {
            const photoValues = photos.map(link => [newReviewId, link]);
            await conn.query(
                `INSERT INTO review_photo (review_id, link) VALUES ?;`,
                [photoValues]
            );
        }

        await updateStoreStarRating(reviewCoreData.store_id, conn);

        await conn.commit();
        return { id: newReviewId, ...reviewCoreData };

    } catch (err) {
        await conn.rollback();
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
};