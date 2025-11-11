//Http Status Code
import { StatusCodes } from "http-status-codes";
//Dto
import { bodyToMission, responseForMissions, responseForMyMissions, responseForMissionComplete } from '#Dto/mission.dto.js';
//Service
import { getMyMissions, challengeNewMission, createMission, getStoreMissions, completeMission } from '#Service/mission.service.js'

//가게 미션 목록 조회
export const handleGetStoreMissions = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : -1;
        const storeId = parseInt(req.params.storeId, 10);
        const cursor = req.query.cursor;
        const limit = Number(req.query.limit);
        const sortBy = req.query.sortBy;
        const missionsData = await getStoreMissions(userId, storeId, cursor, limit, sortBy);
        
        res.status(StatusCodes.OK).success(responseForMissions(missionsData));
    } catch (err) {
        next(err);
    }
};

//내가 도전한 미션 목록 조회
export const handleGetMyMissions = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const { cursor, limit, status } = req.query;

        const isCompleted = (status === 'completed');

        const MissionsData = await getMyMissions(userId, isCompleted, cursor, limit);
        
        res.status(StatusCodes.OK).success(responseForMyMissions(MissionsData));
    } catch (err) {
        next(err);
    }
};

//가게에 미션 추가
export const handleMissionAdd = async (req, res, next) => {
    try {
        const storeId = req.params.storeId;
        const missionData = bodyToMission(req.body);

        const newMission = await createMission(storeId, missionData);

        res.status(StatusCodes.CREATED).success({"missionId": Number(newMission.id)});

    } catch (err) {
        next(err);
    }
};

//미션 도전하기
export const handleChallengeMission = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const missionId = req.params.missionId;

        const result = await challengeNewMission(userId, missionId);

        res.status(StatusCodes.CREATED).success({"userMissionId": Number(result.id)});
    } catch (err) {
        next(err);
    }
};

//미션 완료 처리
export const handleCompleteMission = async (req, res, next) => {
    try {
        const missionId = req.params.missionId;
        const userId = req.params.userId;

        const missionCompleteData = await completeMission(Number(userId), Number(missionId));
        
        res.status(StatusCodes.OK).success(responseForMissionComplete(missionCompleteData));
    } catch (err) {
        next(err);
    }
};