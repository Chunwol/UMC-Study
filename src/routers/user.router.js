//Express
import express from 'express';
//Middlewares
import checkValidation from '#Middleware/validation/validation.middleware.js';
import { authMiddleware } from '#Middleware/auth.middleware.js';
//Controllers
import { handleUserSignUp, handleUserLogin, handleUserToken } from '#Controller/user.controller.js';
import { handleGetMyReviews } from '#Controller/review.controller.js';
import { handleGetMyMissions } from '#Controller/mission.controller.js';
//Validations
import { registerValidation, loginValidation, refreshTokenValidation } from '#Middleware/validation/user.validation.js';
import { validateLimitQuery } from '#Middleware/validation/common.validation.js';
import { validateReviewCursorQuery } from '#Middleware/validation/review.validation.js';
import { validateMissionCursorQuery, validateMyMissionStatusQuery } from '#Middleware/validation/mission.validation.js';

const router = express.Router();

// 회원가입 API
router.post('/signup',
    registerValidation,
    checkValidation,
    handleUserSignUp
);

// 로그인 API
router.post('/login',
    loginValidation,
    checkValidation,
    handleUserLogin
);

// 토큰 갱신 API
router.post('/token',
    refreshTokenValidation,
    checkValidation,
    handleUserToken
);

// 내가 작성한 리뷰 목록 조회 API
router.get('/reviews',
    authMiddleware,
    validateReviewCursorQuery,
    validateLimitQuery,
    checkValidation,
    handleGetMyReviews
);

// 내가 도전한/도전완료한 미션 목록 조회 API
router.get('/missions',
    authMiddleware,
    validateMyMissionStatusQuery,
    validateMissionCursorQuery,
    validateLimitQuery,
    checkValidation,
    handleGetMyMissions
);

export default router;