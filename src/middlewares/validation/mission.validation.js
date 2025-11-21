import { body, param, query } from 'express-validator';
import CustomError from '#Middleware/error/customError.js';

//URL의 missionId 검증
export const validateMissionId = [
    param('missionId')
        .isInt({ min: 1 }).withMessage('미션 ID(missionId)는 1 이상의 숫자여야 합니다.')
        .toInt()
];

//미션 생성 검증
export const addMissionValidation = [
    body('reward')
        .exists().withMessage('미션 보상은 필수입니다.')
        .isInt({ min: 1 }).withMessage('미션 보상은 1 이상의 정수여야 합니다.'),

    body('description')
        .exists().withMessage('미션 설명은 필수입니다.')
        .isString()
        .isLength({ min: 10 }).withMessage('미션 설명은 10자 이상이어야 합니다.'),
    
    body('deadline')
        .exists().withMessage('미션 마감일은 필수입니다.')
        .isISO8601().withMessage('날짜 형식(YYYY-MM-DDTHH:mm:ss.sssZ)이 올바르지 않습니다.'),
];

//미션 목록 조회 정렬 기준 검증
export const validateMissionSortQuery = [
    query('sortBy')
        .optional()
        .isIn(['closingSoon', 'amount']).withMessage("sortBy는 'closingSoon' 또는 'amount'여야 합니다.")
        .default('closingSoon')
];

//미션 목록 조회 커서 검증
export const validateMissionCursorQuery = [
    query('cursor')
        .optional()
        .isString().withMessage('커서(cursor)는 문자열이어야 합니다.')
        .custom((value, { req }) => {
            const sortBy = req.query.sortBy || 'closingSoon';
            const parts = value.split('_');

            if (parts.length !== 2) {
                throw new Error("커서는 'value1_value2' (예: '값1_값2') 형식이어야 합니다.");
            }

            const [val1, val2] = parts;

            if (sortBy === 'amount') {
                const reward = Number(val1);
                const deadline = new Date(val2);
                if (isNaN(reward) || isNaN(deadline.getTime())) {
                    throw new Error("'amount' 정렬 시 커서는 'lastReward_lastDeadline' (예: '10000_ISODateString') 형식이어야 합니다.");
                }
            } else {
                const deadline = new Date(val1);
                const id = Number(val2);
                if (isNaN(deadline.getTime()) || isNaN(id)) {
                    throw new Error("'closingSoon' 정렬 시 커서는 'lastDeadline_lastId' (예: 'ISODateString_101') 형식이어야 합니다.");
                }
            }
            return true;
        })
];

//내 미션 상태 검증
export const validateMyMissionStatusQuery = [
    query('status')
        .exists().withMessage('status 쿼리(in-progress 또는 completed)는 필수입니다.')
        .isIn(['in-progress', 'completed']).withMessage("status는 'in-progress' 또는 'completed'여야 합니다.")
];