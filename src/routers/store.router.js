//Express
import express from 'express';
// Middlewares
import checkValidation from '#Middleware/validation/validation.middleware.js';
import { authMiddleware, optionalAuthMiddleware } from '#Middleware/auth.middleware.js';
import { checkStoreExists, checkStoreOwnership } from '#Middleware/store.middleware.js';
import { checkMissionExists, checkIsNotChallenging, checkMissionIsInProgress } from '#Middleware/mission.middleware.js';
import { upload } from '#Middleware/upload.middleware.js';
// Controllers
import { handleStoreAdd } from '#Controller/store.controller.js';
import { handleGetStoreReviews, handleReviewAdd } from '#Controller/review.controller.js';
import { handleChallengeMission, handleCompleteMission, handleMissionAdd, handleGetStoreMissions } from '#Controller/mission.controller.js';
// Validations
import { validateLimitQuery } from '#Middleware/validation/common.validation.js';
import { validateUserIdParam } from '#Middleware/validation/user.validation.js';
import { validateStoreId, addStoreValidation } from '#Middleware/validation/store.validation.js';
import { validateReviewCursorQuery, addReviewValidation, validateReviewSortQuery } from '#Middleware/validation/review.validation.js';
import { validateMissionId, addMissionValidation, validateMissionCursorQuery, validateMissionSortQuery  } from '#Middleware/validation/mission.validation.js';

const router = express.Router();

// 특정 가게 리뷰 목록 조회 API
router.get('/:storeId/reviews',
    /* #swagger.tags = ['Stores']
       #swagger.summary = '특정 가게 리뷰 목록 조회'
       #swagger.parameters['storeId'] = { in: 'path', type: 'integer' }
       #swagger.parameters['cursor'] = { in: 'query', type: 'string' }
       #swagger.parameters['limit'] = { in: 'query', type: 'integer' }
       #swagger.parameters['sortBy'] = { in: 'query', type: 'string', description: "'latest' | 'rating'" }
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
                                       cursor: { type: "object" }
                                   }
                               }
                           }
                       }]
                   }
               }
           }
       }
       #swagger.responses[404] = { description: "가게 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    validateStoreId,
    checkStoreExists,
    validateReviewCursorQuery,
    validateLimitQuery,
    validateReviewSortQuery,
    checkValidation,
    handleGetStoreReviews
);

// 특정 가게 미션 목록 조회 API
router.get('/:storeId/missions',
    /* #swagger.tags = ['Stores']
       #swagger.summary = '특정 가게 미션 목록 조회'
       #swagger.parameters['storeId'] = { in: 'path', type: 'integer' }
       #swagger.responses[200] = {
           description: "조회 성공",
           content: {
               "application/json": {
                   schema: { $ref: "#/definitions/SuccessResponse" }
               }
           }
       }
       #swagger.responses[404] = { description: "가게 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    optionalAuthMiddleware,
    validateStoreId,
    checkStoreExists,
    validateMissionCursorQuery,
    validateLimitQuery,
    validateMissionSortQuery,
    checkValidation,
    handleGetStoreMissions
);

// 가게 추가 API
router.post('/',
    /* #swagger.tags = ['Store']
        #swagger.summary = '가게 생성 API (이미지 포함)'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.requestBody = {
           required: true,
           content: {
               "multipart/form-data": {
                   schema: {
                       type: "object",
                       properties: {
                           name: { type: "string", example: "맛있는 파스타집" },
                           addressCode: { type: "string", example: "4111113000" },
                           addressDetail: { type: "string", example: "동양빌딩 1층" },
                           industry: { type: "string", example: "양식" },
                           storeHours: {
                               type: "string",
                               example: "[{\"day_of_week\": 1, \"open_time\": \"11:30\", \"close_time\": \"15:00\"}]"
                           },
                           photos: {
                               type: "array",
                               items: { type: "string", format: "binary" }
                           }
                       },
                       required: ["name", "addressCode", "addressDetail"]
                   }
               }
           }
       }
       #swagger.responses[201] = {
           description: "가게 생성 성공",
           content: {
               "application/json": {
                   schema: {
                       resultType: "SUCCESS", error: null, success: { storeId: 1 }
                   }
               }
           }
       }
       #swagger.responses[400] = { description: "실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[401] = { description: "인증 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    upload.array('photos', 5),
    addStoreValidation,
    checkValidation,
    handleStoreAdd
);

// 리뷰 작성 API
router.post('/:storeId/reviews',
    /* #swagger.tags = ['Stores']
       #swagger.summary = '리뷰 작성 API (이미지 포함)'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['storeId'] = { in: 'path', type: 'integer' }
       #swagger.requestBody = {
           required: true,
           content: {
               "multipart/form-data": {
                   schema: {
                       type: "object",
                       required: ["star_rating", "content"],
                       properties: {
                           star_rating: { type: "number", example: 5 },
                           content: { type: "string", example: "너무맛있어요!! 다음에도 또 방문할게요~" },
                           photos: { 
                               type: "array", 
                               items: { type: "string", format: "binary" },
                               description: "리뷰 사진 파일들"
                           }
                       }
                   }
               }
           }
       }
       #swagger.responses[201] = {
           description: "리뷰 작성 성공",
           content: {
               "application/json": {
                   schema: {
                       allOf: [{ $ref: "#/definitions/SuccessResponse" }, {
                           properties: { success: { type: "object", properties: { reviewId: { type: "integer" } } } }
                       }]
                   }
               }
           }
       }
       #swagger.responses[400] = { description: "유효성 실패", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[404] = { description: "가게 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    validateStoreId,
    checkStoreExists,
    upload.array('photos', 5),
    addReviewValidation,
    checkValidation,
    handleReviewAdd
);

// 미션 생성 API
router.post('/:storeId/missions',
    /* #swagger.tags = ['Stores']
       #swagger.summary = '미션 생성 API (가게 주인 전용)'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['storeId'] = { in: 'path', type: 'integer' }
       #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: {
                       type: "object",
                       required: ["reward", "description", "deadline"],
                       properties: {
                           reward: { type: "integer", example: 1000 },
                           description: { type: "string", example: "다음 방문 시 1000원 할인" },
                           deadline: { type: "string", format: "date-time", example: "2025-12-31T23:59:59Z" }
                       }
                   }
               }
           }
       }
       #swagger.responses[201] = { description: "생성 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
       #swagger.responses[403] = { description: "권한 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[404] = { description: "가게 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    checkStoreExists,
    checkStoreOwnership,
    addMissionValidation,
    checkValidation,
    handleMissionAdd
);

// 미션 도전하기 API
router.post('/:storeId/missions/:missionId/challenge',
    /* #swagger.tags = ['Stores']
       #swagger.summary = '미션 도전하기 API'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['storeId'] = { in: 'path', type: 'integer' }
       #swagger.parameters['missionId'] = { in: 'path', type: 'integer' }
       #swagger.responses[201] = { description: "도전 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
       #swagger.responses[404] = { description: "미션 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[409] = { description: "이미 도전 중", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    validateStoreId,
    validateMissionId,
    checkMissionExists,
    checkIsNotChallenging,
    checkValidation,
    handleChallengeMission
);

// 유저 미션 완료 처리 API
router.patch('/:storeId/missions/:missionId/users/:userId/complete',
    /* #swagger.tags = ['Stores']
       #swagger.summary = '미션 완료 처리 API (가게 주인 전용)'
       #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['storeId'] = { in: 'path', type: 'integer' }
       #swagger.parameters['missionId'] = { in: 'path', type: 'integer' }
       #swagger.parameters['userId'] = { in: 'path', type: 'integer', description: "미션 완료한 유저 ID" }
       #swagger.responses[200] = { description: "완료 성공", content: { "application/json": { schema: { $ref: "#/definitions/SuccessResponse" } } } }
       #swagger.responses[403] = { description: "권한 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
       #swagger.responses[404] = { description: "도전 내역 없음", content: { "application/json": { schema: { $ref: "#/definitions/ErrorResponse" } } } }
    */
    authMiddleware,
    validateStoreId,
    validateMissionId,
    validateUserIdParam,
    checkStoreExists,
    checkStoreOwnership,
    checkMissionExists,
    checkMissionIsInProgress,
    checkValidation,
    handleCompleteMission
);

export default router;