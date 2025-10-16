import { addMission, addUserMission } from '#Repository/mission.repository.js';

//미션 생성
export const createMission = async (storeId, missionData) => {
    const newMission = await addMission({
        store_id: storeId,
        ...missionData
    });
    return newMission;
};

//미션 도전
export const challengeNewMission = async (userId, missionId) => {
    const result = await addUserMission(userId, missionId);
    return result;
};