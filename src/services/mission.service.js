import { addMission, addUserMission, getMissionsByStoreId } from '#Repository/mission.repository.js';

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

//가게 미션 목록 조회
export const getStoreMissions = async (userId, storeId, cursor, requestedLimit, sortBy) => {
    
    let finalLimit = requestedLimit || 10;
    if (finalLimit > 30) {
        finalLimit = 30;
    }
    const missions = await getMissionsByStoreId(userId, storeId, cursor, finalLimit, sortBy);

    let nextCursor = null;
    if (missions.length === finalLimit) {
        const lastMission = missions[missions.length - 1];
        if (sortBy === 'amount') {
            nextCursor = `${lastMission.reward}_${lastMission.deadline.toISOString()}`;
        } else {
            nextCursor = `${lastMission.deadline.toISOString()}_${lastMission.id}`;
        }
    }
    return { missions, nextCursor, limit: finalLimit };
};