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

// 구글 로그인
router.get('/google',
    /* #swagger.tags = ['User'] */
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 구글 로그인 콜백
router.get('/google/callback', 
    /* #swagger.tags = ['User'] */
    passport.authenticate('google', { session: false, failureRedirect: '/api/user/login' }),
    handleGoogleLoginCallback
);

// 소셜 추가 정보 입력
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
                           phoneNumber: { type: "string", example: "010-1234-5678" },
                           favoriteFoodIds: { type: "array", items: { type: "integer" }, example: [1, 2] },
                           terms: { 
                               type: "array", 
                               items: { 
                                   type: "object", 
                                   properties: { termId: { type: "integer" }, isAgreed: { type: "boolean" } } 
                               },
                               example: [{ termId: 1, isAgreed: true }]
                           }
                       }
                   }
               }
           }
       }
       #swagger.responses[200] = { 
           description: "정보 입력 성공", 
           content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } 
       }
       #swagger.responses[400] = { description: "잘못된 데이터", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[401] = { description: "인증 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    validateUserInfoUpdate,
    checkValidation,
    handleSocialRegister
);


// 일반 로그인
router.post('/login',
    /* #swagger.tags = ['User']
       #swagger.summary = '로그인 API'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       required: ["email", "password"],
                       properties: {
                           email: { type: "string", example: "user@example.com" },
                           password: { type: "string", example: "password123!" }
                       }
                   }
               }
           }
       }
       #swagger.responses[200] = { description: "로그인 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
       #swagger.responses[401] = { description: "로그인 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    loginValidation,
    checkValidation,
    handleUserLogin
);

// 회원가입
router.post('/signup',
    /* #swagger.tags = ['User']
       #swagger.summary = '회원가입 API'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       required: ["email", "password", "name", "gender", "birthday", "addressCode", "terms"],
                       properties: {
                           email: { type: "string", example: "user@example.com" },
                           password: { type: "string", example: "password123!" },
                           name: { type: "string", example: "홍길동" },
                           gender: { type: "string", enum: ["male", "female"], example: "male" },
                           birthday: { type: "string", format: "date", example: "1999-01-01" },
                           addressCode: { type: "string", example: "1234567890" },
                           addressDetail: { type: "string", example: "상세주소" },
                           favoriteFoodIds: { type: "array", items: { type: "integer" }, example: [1, 2] },
                           terms: { 
                               type: "array", 
                               items: { 
                                   type: "object", 
                                   properties: { termId: { type: "integer" }, isAgreed: { type: "boolean" } } 
                               },
                               example: [{ termId: 1, isAgreed: true }]
                           }
                       }
                   }
               }
           }
       }
       #swagger.responses[201] = { description: "가입 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
       #swagger.responses[409] = { description: "이메일 중복", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    registerValidation,
    checkValidation,
    handleUserSignUp
);

// 토큰 갱신 API
router.post('/token',
    /* #swagger.tags = ['User']
       #swagger.summary = '토큰 재발급 API'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       required: ["refreshToken"],
                       properties: { refreshToken: { type: "string", example: "eyJ..." } }
                   }
               }
           }
       }
       #swagger.responses[200] = { description: "재발급 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
    */
    refreshTokenValidation,
    checkValidation,
    handleUserToken
);

// 내가 작성한 리뷰 목록 조회 API
router.get('/reviews',
    /* #swagger.tags = ['User']
       #swagger.summary = '내가 쓴 리뷰 목록 API'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['cursor'] = { in: 'query', type: 'string', description: '마지막 리뷰 ID' }
       #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: '조회 개수' }
       #swagger.responses[200] = { description: "조회 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
       #swagger.responses[401] = { description: "인증 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    validateReviewCursorQuery,
    validateLimitQuery,
    checkValidation,
    handleGetMyReviews
);

// 내가 도전한/도전완료한 미션 목록 조회 API
router.get('/missions',
    /* #swagger.tags = ['User']
       #swagger.summary = '내 미션 목록 조회 API'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['status'] = { in: 'query', type: 'string', required: true, description: "'in-progress' | 'completed'" }
       #swagger.parameters['cursor'] = { in: 'query', type: 'string' }
       #swagger.parameters['limit'] = { in: 'query', type: 'integer' }
       #swagger.responses[200] = { description: "조회 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
       #swagger.responses[400] = { description: "파라미터 오류", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    validateMyMissionStatusQuery,
    validateMissionCursorQuery,
    validateLimitQuery,
    checkValidation,
    handleGetMyMissions
);

export default router;