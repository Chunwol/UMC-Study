import { StatusCodes } from "http-status-codes";
import { bodyToStore, bodyToReview, bodyToMission } from '#Dto/store.dto.js';
import { createStore, createReview } from '#Service/store.service.js';
import { challengeNewMission, createMission } from '#Service/mission.service.js'
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

    res.status(StatusCodes.CREATED).json({
        "status": "success",
        "data": { "storeId": Number(newStore.id) }
    });
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


        res.status(StatusCodes.CREATED).json({
            "status": "success",
            "data": { "reviewId": Number(newReview.id) }
        });

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

        res.status(StatusCodes.CREATED).json({
            "status": "success",
            "data": { "missionId": Number(newMission.id) }
        });

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

        res.status(StatusCodes.CREATED).json({
            "status": "success",
            "data": { "userMissionId": Number(result.id) }
        });

    } catch (err) {
        next(err);
    }
};