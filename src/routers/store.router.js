import express from 'express';

// Middlewares
import { authMiddleware, optionalAuthMiddleware, checkStoreOwnership } from '#Middleware/auth.middleware.js';
import { upload } from '#Middleware/upload.middleware.js';
import checkValidation from '#Middleware/validation/validation.middleware.js';

// Controllers
import { handleStoreAdd,handleReviewAdd, handleMissionAdd, handleChallengeMission, handleGetStoreReviews, handleGetStoreMissions, handleCompleteMission } from '#Controller/store.controller.js';

// Validations
import { addReviewValidation, addStoreValidation, checkStoreExists, validateStoreId, validateReviewCursorQuery, validateLimitQuery, validateSortQuery} from '#Middleware/validation/store.validation.js';
import { validateUserIdParam } from '#Middleware/validation/user.validation.js';
import { addMissionValidation, checkMissionExists, checkIsNotChallenging,validateMissionId, validateMissionSortQuery, validateMissionCursorQuery, checkMissionIsInProgress } from '#Middleware/validation/mission.validation.js';

const router = express.Router();

//특정 가게 리뷰 목록 조회 API
router.get('/:storeId/reviews',
    validateStoreId,
    checkStoreExists,
    validateReviewCursorQuery,
    validateLimitQuery,
    validateSortQuery,
    checkValidation,
    handleGetStoreReviews
);

//특정 가게 미션 목록 조회 API
router.get('/:storeId/missions',
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
    authMiddleware,
    upload.array('photos', 5),
    addStoreValidation,
    checkValidation,
    handleStoreAdd
);

// 가게 리뷰 추가 API
router.post('/:storeId/reviews',
    authMiddleware,
    validateStoreId,
    checkStoreExists,
    upload.array('photos', 5),
    addReviewValidation,
    checkValidation,
    handleReviewAdd
);

// 가게 미션 추가 API
router.post('/:storeId/missions',
    authMiddleware,
    checkStoreExists,
    checkStoreOwnership,
    addMissionValidation,
    checkValidation,
    handleMissionAdd
);

// 미션 도전하기 API
router.post('/:storeId/missions/:missionId/challenge',
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