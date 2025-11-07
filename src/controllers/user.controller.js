import { StatusCodes } from "http-status-codes";
import { bodyToUser, bodyToLogin, bodyToToken, responseForMyReviews, responseForMyMissions } from "../dtos/user.dto.js";
import { userSignUp, userLogin, getMyReviews } from "#Service/user.service.js";
import { getMyMissions } from "#Service/mission.service.js";
import { tokenReissue, tokenSign } from "#Service/auth.service.js";

//회원가입
export const handleUserSignUp = async (req, res, next) => {
  try {
    // console.log("회원가입을 요청했습니다!");
    // console.log("body:", req.body);
    const userId = await userSignUp(bodyToUser(req.body));
    const tokens = await tokenSign(userId);

    res.status(StatusCodes.CREATED).json({ "status": "success", data: tokens });
  } catch (err) {
    next(err);
  }
};

//로그인
export const handleUserLogin = async (req, res, next) => {
  try {
    // console.log("로그인을 요청했습니다!");
    // console.log("body:", req.body);
    const userId = await userLogin(bodyToLogin(req.body));
    const tokens = await tokenSign(userId);

    res.status(StatusCodes.OK).json({ "status": "success", data: tokens });
  } catch (err) {
    next(err);
  }
};

//토큰갱신
export const handleUserToken = async (req, res, next) => {
  try {
    // console.log("토큰 갱신 요청했습니다!");
    // console.log("body:", req.body);
    const tokens = await tokenReissue(bodyToToken(req.body));

    res.status(StatusCodes.OK).json({ "status": "success", data: tokens });
  } catch (err) {
    next(err);
  }
};

//내가 작성한 리뷰 목록 조회
export const handleGetMyReviews = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const cursor = req.query.cursor;
        const limit = Number(req.query.limit);

        const reviewsData = await getMyReviews(userId, cursor, limit);
        
        res.status(StatusCodes.OK).json(responseForMyReviews(reviewsData));
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
        
        res.status(StatusCodes.OK).json(responseForMyMissions(MissionsData));
    } catch (err) {
        next(err);
    }
};