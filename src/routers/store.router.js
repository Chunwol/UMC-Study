import express from 'express';

// Middlewares
import { authMiddleware, checkStoreOwnership } from '#Middleware/auth.middleware.js';
import { upload } from '#Middleware/upload.middleware.js';
import checkValidation from '#Middleware/validation/validation.middleware.js';

// Controllers
import { handleStoreAdd,handleReviewAdd, handleMissionAdd, handleChallengeMission, handleGetStoreReviews } from '#Controller/store.controller.js';

// Validations
import { addReviewValidation, addStoreValidation, checkStoreExists, validateStoreId, validateCursorQuery, validateLimitQuery, validateSortQuery} from '#Middleware/validation/store.validation.js';
import { addMissionValidation, checkMissionExists, checkIsNotChallenging,validateMissionId } from '#Middleware/validation/mission.validation.js';

const router = express.Router();

//특정 가게 리뷰 목록 조회 API
router.get('/:storeId/reviews',
    validateStoreId,
    checkStoreExists,
    validateCursorQuery,
    validateLimitQuery,
    validateSortQuery,
    checkValidation,
    handleGetStoreReviews
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

export default router;