import { body } from 'express-validator';
import CustomError from '#Middleware/error/customError.js';
import { isMissionExist, isMissionChallenging } from '#Repository/mission.repository.js';

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

//미션 존재여부 확인
export const checkMissionExists = async (req, res, next) => {
    try {
        const missionId = req.params.missionId;
        const exists = await isMissionExist(missionId);
        if (!exists) {
            throw new CustomError({ name: 'MISSION_NOT_FOUND' });
        }
        next();
    } catch (err) {
        next(err);
    }
};

//미션 도전중인지 확인
export const checkIsNotChallenging = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const missionId = req.params.missionId;
        const isChallenging = await isMissionChallenging(userId, missionId);
        if (isChallenging) {
            throw new CustomError({ name: 'MISSION_ALREADY_CHALLENGING' });
        }
        next();
    } catch (err) {
        next(err);
    }
};