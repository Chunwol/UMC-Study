import { body, param, query } from 'express-validator';
import CustomError from '#Middleware/error/customError.js';

//리뷰 생성 검증
export const addReviewValidation = [
    body('star_rating')
        .exists().withMessage('별점은 필수입니다.')
        .isFloat({ min: 0.5, max: 5.0 }).withMessage('별점은 0.5 이상 5.0 이하의 숫자여야 합니다.'),

    body('content')
        .exists().withMessage('리뷰 내용은 필수입니다.')
        .isString()
        .isLength({ min: 10 }).withMessage('리뷰 내용은 10자 이상이어야 합니다.')
];

// 리뷰 목록 조회 커서 검증
export const validateReviewCursorQuery = [
    query('cursor')
        .optional()
        .isString().withMessage('커서(cursor)는 문자열이어야 합니다.')
        .custom((value, { req }) => {
            const sortBy = req.query.sortBy || 'latest'; 
            
            if (sortBy === 'rating') {
                const parts = value.split('_');
                
                if (parts.length !== 2) {
                    throw new Error("'rating' 정렬 시 커서는 'lastRating_lastId' (예: '5_100') 형식이어야 합니다.");
                }
                
                const lastRating = Number(parts[0]);
                const lastId = Number(parts[1]);

                if (isNaN(lastRating) || isNaN(lastId)) {
                    throw new Error("'rating' 정렬 시 커서 값(별점, ID)은 숫자여야 합니다.");
                }

            } else {
                if (isNaN(Number(value))) {
                    throw new Error("'latest' 정렬 시 커서는 'lastId' (예: '100') 형식의 숫자 문자열이어야 합니다.");
                }
            }
            return true;
        })
];

//리뷰 목록 조회 정렬 기준 검증
export const validateReviewSortQuery = [
    query('sortBy')
        .optional()
        .isIn(['latest', 'rating']).withMessage("sortBy는 'latest' 또는 'rating'이어야 합니다.")
        .default('latest')
];