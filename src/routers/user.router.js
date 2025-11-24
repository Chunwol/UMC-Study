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
    /* #swagger.tags = ['Users']
       #swagger.summary = '회원가입 API'
       #swagger.description = '새로운 사용자를 등록합니다.'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       required: ["email", "password", "name", "gender", "birthday", "addressCode", "terms"],
                       properties: {
                           email: { type: "string", example: "user@umc.com" },
                           password: { type: "string", example: "password1234" },
                           name: { type: "string", example: "천월" },
                           gender: { type: "string", enum: ["male", "female"], example: "male" },
                           birthday: { type: "string", format: "date", example: "2003-02-15" },
                           addressCode: { type: "string", example: "4111113000" },
                           addressDetail: { type: "string", example: "상세주소" },
                           favoriteFoodIds: { 
                               type: "array", 
                               items: { type: "integer" }, 
                               example: [1, 4, 5] 
                           },
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
       #swagger.responses[201] = {
           description: "회원가입 성공",
           content: {
               "application/json": {
                   schema: {
                       allOf: [{ $ref: "#/definitions/SuccessResponse" }, {
                           properties: {
                               success: {
                                   type: "object",
                                   properties: {
                                       accessToken: { type: "string" },
                                       refreshToken: { type: "string" }
                                   }
                               }
                           }
                       }]
                   }
               }
           }
       }
       #swagger.responses[400] = { description: "요청 데이터 유효성 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[409] = { description: "이미 존재하는 이메일", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    registerValidation,
    checkValidation,
    handleUserSignUp
);

// 로그인 API
router.post('/login',
    /* #swagger.tags = ['Users']
       #swagger.summary = '로그인 API'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       required: ["email", "password"],
                       properties: {
                           email: { type: "string", example: "user2@umc.com" },
                           password: { type: "string", example: "password1234" }
                       }
                   }
               }
           }
       }
       #swagger.responses[200] = {
           description: "로그인 성공",
           content: {
               "application/json": {
                   schema: {
                       allOf: [{ $ref: "#/definitions/SuccessResponse" }, {
                           properties: {
                               success: {
                                   type: "object",
                                   properties: {
                                       accessToken: { type: "string" },
                                       refreshToken: { type: "string" }
                                   }
                               }
                           }
                       }]
                   }
               }
           }
       }
       #swagger.responses[400] = { description: "입력값 형식 오류", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[401] = { description: "로그인 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    loginValidation,
    checkValidation,
    handleUserLogin
);

// 토큰 갱신 API
router.post('/token',
    /* #swagger.tags = ['Users']
       #swagger.summary = '토큰 재발급 API'
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       required: ["refreshToken"],
                       properties: {
                           refreshToken: { type: "string", example: "eyJhbGci..." }
                       }
                   }
               }
           }
       }
       #swagger.responses[200] = {
           description: "토큰 재발급 성공",
           content: {
               "application/json": {
                   schema: {
                       allOf: [{ $ref: "#/definitions/SuccessResponse" }, {
                           properties: {
                               success: {
                                   type: "object",
                                   properties: {
                                       accessToken: { type: "string" },
                                       refreshToken: { type: "string" }
                                   }
                               }
                           }
                       }]
                   }
               }
           }
       }
       #swagger.responses[400] = { description: "토큰 미입력", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[401] = { description: "유효하지 않은 토큰", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    refreshTokenValidation,
    checkValidation,
    handleUserToken
);

// 내가 작성한 리뷰 목록 조회 API
router.get('/reviews',
    /* #swagger.tags = ['Users']
       #swagger.summary = '내가 쓴 리뷰 목록 API'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['cursor'] = { in: 'query', type: 'string', description: '마지막 리뷰 ID' }
       #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: '조회 개수' }
       #swagger.responses[200] = {
           description: "조회 성공",
           content: {
               "application/json": {
                   schema: {
                       allOf: [{ $ref: "#/definitions/SuccessResponse" }, {
                           properties: {
                               success: {
                                   type: "object",
                                   properties: {
                                       reviews: { type: "array", items: { type: "object" } },
                                       cursor: { type: "object", properties: { nextCursor: { type: "integer" }, hasNextPage: { type: "boolean" } } }
                                   }
                               }
                           }
                       }]
                   }
               }
           }
       }
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
    /* #swagger.tags = ['Users']
       #swagger.summary = '내 미션 목록 조회 API'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['status'] = { in: 'query', type: 'string', required: true, description: "'in-progress' | 'completed'" }
       #swagger.parameters['cursor'] = { in: 'query', type: 'string' }
       #swagger.parameters['limit'] = { in: 'query', type: 'integer' }
       #swagger.responses[200] = {
           description: "조회 성공",
           content: {
               "application/json": {
                   schema: {
                       allOf: [{ $ref: "#/definitions/SuccessResponse" }, {
                           properties: {
                               success: {
                                   type: "object",
                                   properties: {
                                       missions: { type: "array", items: { type: "object" } },
                                       cursor: { type: "object" }
                                    }
                               }
                           }
                       }]
                   }
               }
           }
       }
       #swagger.responses[400] = { description: "파라미터 오류", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[401] = { description: "인증 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    validateMyMissionStatusQuery,
    validateMissionCursorQuery,
    validateLimitQuery,
    checkValidation,
    handleGetMyMissions
);

export default router;