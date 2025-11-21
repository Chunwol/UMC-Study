import { body, param, query } from 'express-validator';
import CustomError from '#Middleware/error/customError.js';

//목록 조회 커서 검증
export const validateCursorQuery = [
    query('cursor')
        .optional()
        .isString().withMessage('커서(cursor)는 문자열이어야 합니다.')
        .matches(/^\d+$/).withMessage('커서(cursor)는 숫자 형식의 문자열이어야 합니다.')
];

//조회 제한 수 검증
export const validateLimitQuery = [
    query('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('limit은 1 이상의 정수여야 합니다.')
        .toInt()
];