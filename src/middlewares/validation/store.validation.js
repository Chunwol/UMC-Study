import { body, param, query } from 'express-validator';
import CustomError from '#Middleware/error/customError.js';
import { isStoreExist } from '#Repository/store.repository.js';

// URL의 storeId 검증
export const validateStoreId = [
    param('storeId')
        .isInt({ min: 1 }).withMessage('가게 ID(storeId)는 1 이상의 숫자여야 합니다.')
        .toInt()
];

//가게 생성 검증
export const addStoreValidation = [
  body('name')
    .exists().withMessage('가게 이름은 필수입니다.')
    .isString().withMessage('가게 이름은 문자열이어야 합니다.')
    .isLength({ min: 1, max: 30 }).withMessage('가게 이름은 1자 이상 30자 이하이어야 합니다.'),

  body('addressDetail')
    .exists().withMessage('가게 주소는 필수입니다.')
    .isString().withMessage('가게 주소는 문자열이어야 합니다.'),
    
  body('addressCode')
    .exists().withMessage('지역 코드는 필수입니다.')
    .isString()
    .isLength({ min: 10, max: 10 }).withMessage('지역 코드는 10자리여야 합니다.')
    .matches(/^\d+$/).withMessage('지역 코드는 숫자만 포함해야 합니다.'),
    
  body('industry')
    .optional()
    .isString().withMessage('업종은 문자열이어야 합니다.'),
    
  body('storeHours')
    .optional()
    .isJSON().withMessage('영업시간 정보는 유효한 JSON 문자열이어야 합니다.')
    .custom((value) => {
      const hours = JSON.parse(value);
      if (!Array.isArray(hours)) {
        throw new Error('영업시간 정보는 배열 형태여야 합니다.');
      }
      for (const h of hours) {
        if (typeof h.day_of_week !== 'number' || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(h.open_time) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(h.close_time)) {
          throw new Error('영업시간 배열의 각 요소는 { day_of_week: number, open_time: "HH:MM", close_time: "HH:MM" } 형태여야 합니다.');
        }
      }
      return true;
    })
];

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

//가게 존재여부 확인
export const checkStoreExists = async (req, res, next) => {
    try {
        const storeId = req.params.storeId;
        const exists = await isStoreExist(storeId);
        if (!exists) {
            throw new CustomError({ name: 'STORE_NOT_FOUND' });
        }
        next();
    } catch (err) {
        next(err);
    }
};


//리뷰 목록 조회 쿼리 검증
export const validateCursorQuery = [
    query('cursor')
        .optional()
        .isString().withMessage('커서(cursor)는 문자열이어야 합니다.') // ID(숫자) 또는 '별점_ID'(문자열)
];

//리뷰 목록 조회 제한 수 검증
export const validateLimitQuery = [
    query('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('limit은 1 이상의 정수여야 합니다.')
        .toInt()
];

//리뷰 목록 조회 정렬 기준 검증
export const validateSortQuery = [
    query('sortBy')
        .optional()
        .isIn(['latest', 'rating']).withMessage("sortBy는 'latest' 또는 'rating'이어야 합니다.")
        .default('latest')
];