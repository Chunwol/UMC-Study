import { StatusCodes } from "http-status-codes";
import { bodyToStore, bodyToReview, bodyToMission, responseForReviews, responseForMissions, responseForMissionComplete } from '#Dto/store.dto.js';
import { createStore, createReview, getStoreReviews } from '#Service/store.service.js';
import { challengeNewMission, createMission, getStoreMissions, completeMission } from '#Service/mission.service.js'
import { saveFile } from '#Service/file.service.js';

//가게 추가
export const handleStoreAdd = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const storeData = bodyToStore(req.body, req.files);

    const photoUrls = [];
    if (req.files && req.files.length > 0) {
      const savePromises = req.files.map(file => saveFile('stores', file));
      const urls = await Promise.all(savePromises);
      photoUrls.push(...urls);
    }

    const finalStoreData = { ...storeData, photoUrls };
    const newStore = await createStore(userId, finalStoreData);

    res.status(StatusCodes.CREATED).success({"storeId": Number(newStore.id)})
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