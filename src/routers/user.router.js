//Express
import express from 'express';
import passport from 'passport';
//Middlewares
import checkValidation from '#Middleware/validation/validation.middleware.js';
import { authMiddleware } from '#Middleware/auth.middleware.js';
//Controllers
import { handleUserSignUp, handleUserLogin, handleGoogleLoginCallback, handleSocialRegister, handleUserToken } from '#Controller/user.controller.js';
import { handleGetMyReviews } from '#Controller/review.controller.js';
import { handleGetMyMissions } from '#Controller/mission.controller.js';
//Validations
import { registerValidation, loginValidation, refreshTokenValidation, validateUserInfoUpdate } from '#Middleware/validation/user.validation.js';
import { validateLimitQuery } from '#Middleware/validation/common.validation.js';
import { validateReviewCursorQuery } from '#Middleware/validation/review.validation.js';
import { validateMissionCursorQuery, validateMyMissionStatusQuery } from '#Middleware/validation/mission.validation.js';

const router = express.Router();

// 1. 구글 로그인 시작
router.get('/google',
    /* #swagger.tags = ['Users'] */
    passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. 구글 로그인 콜백
router.get('/google/callback', 
    /* #swagger.tags = ['Users'] */
    passport.authenticate('google', { session: false, failureRedirect: '/api/user/login' }),
    handleGoogleLoginCallback
);

// 3. 일반 로그인 (Local)
router.post('/login', loginValidation, checkValidation, handleUserLogin);

// 4. 회원가입
router.post('/signup', registerValidation, checkValidation, handleUserSignUp);

// 5. 추가 정보 입력 (인증 필요)
router.patch('/social/register',
    /* #swagger.tags = ['User']
       #swagger.summary = '소셜 로그인 후 추가 정보 입력'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       properties: {
                           name: { type: "string", example: "홍길동" },
                           gender: { type: "string", enum: ["male", "female"], example: "male" },
                           birthday: { type: "string", format: "date", example: "1999-01-01" },
                           addressCode: { type: "string", example: "1234567890" },
                           addressDetail: { type: "string", example: "상세주소" },
                           phoneNumber: { type: "string", example: "010-1234-5678" }
                       }
                   }
               }
           }
       }
       #swagger.responses[200] = { 
           description: "정보 입력 성공", 
           content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } 
       }
    */
    authMiddleware,
    validateUserInfoUpdate,
    checkValidation,
    handleSocialRegister
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