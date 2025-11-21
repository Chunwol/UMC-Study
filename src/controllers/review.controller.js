//Http Status Code
import { StatusCodes } from "http-status-codes";
//Dto
import { bodyToReview, responseForMyReviews, responseForReviews } from '#Dto/review.dto.js';
//Service
import { createReview, getStoreReviews, getMyReviews } from '#Service/review.service.js';

//가게 리뷰 목록 조회
export const handleGetStoreReviews = async (req, res, next) => {
    try {
        const storeId = parseInt(req.params.storeId, 10);
        const cursor = req.query.cursor;
        const limit = Number(req.query.limit);
        const sortBy = req.query.sortBy;
        const reviewData = await getStoreReviews(storeId, cursor, limit, sortBy);
        res.status(StatusCodes.OK).success(responseForReviews(reviewData));
    } catch (err) {
        next(err);
    }
};

//내가 작성한 리뷰 목록 조회
export const handleGetMyReviews = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const cursor = req.query.cursor;
        const limit = Number(req.query.limit);

        const reviewsData = await getMyReviews(userId, cursor, limit);
        
        res.status(StatusCodes.OK).success(responseForMyReviews(reviewsData));
    } catch (err) {
        next(err);
    }
};

//가게에 리뷰추가
export const handleReviewAdd = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const storeId = req.params.storeId;
        const reviewData = bodyToReview(req.body, req.files);

        const photoUrls = [];
        if (req.files && req.files.length > 0) {
          const savePromises = req.files.map(file => saveFile('reviews', file));
          const urls = await Promise.all(savePromises);
          photoUrls.push(...urls);
        }
        const finalReviewData = { ...reviewData, photoUrls };
        const newReview = await createReview(userId, storeId, finalReviewData);

        res.status(StatusCodes.CREATED).success({ "reviewId": Number(newReview.id)});
    } catch (err) {
        next(err);
    }
};