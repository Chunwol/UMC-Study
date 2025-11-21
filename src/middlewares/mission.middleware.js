import CustomError from '#Middleware/error/customError.js';
import { isMissionExist, isMissionChallenging, getUserMissionStatus } from '#Repository/mission.repository.js';

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

//미션 진행중인지 확인
export const checkMissionIsInProgress = async (req, res, next) => {
    try {
        const { missionId, userId } = req.params;
        
        const missionStatus = await getUserMissionStatus(userId, missionId);

        if (!missionStatus) {
            throw new CustomError({ name: 'MISSION_NOT_CHALLENGING', message: '이 유저는 해당 미션에 도전하지 않았습니다.' });
        }
        if (missionStatus.status === true) {
            throw new CustomError({ name: 'MISSION_ALREADY_COMPLETED' });
        }
        next();
    } catch (err) {
        next(err);
    }
};