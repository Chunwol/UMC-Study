import express from 'express';

//Middlewares
import { authMiddleware, checkStoreOwnership } from '#Middleware/auth.middleware.js';
import { upload } from '#Middleware/upload.middleware.js';
import checkValidation from '#Middleware/validation/validation.middleware.js';

//Controllers
import { handleStoreAdd, handleReviewAdd, handleMissionAdd, handleChallengeMission } from '#Controller/store.controller.js';

//Validations
import { addReviewValidation, addStoreValidation, checkStoreExists } from '#Middleware/validation/store.validation.js';
import { addMissionValidation, checkMissionExists, checkIsNotChallenging } from '#Middleware/validation/mission.validation.js'

const router = express.Router();

router.use(authMiddleware); // 인증 미들웨어

router.post('/', upload.array('photos', 5), addStoreValidation);
router.post('/:storeId/reviews', upload.array('photos', 5), addReviewValidation, checkStoreExists);
router.post('/:storeId/missions', addMissionValidation, checkStoreExists, checkStoreOwnership);
router.post('/:storeId/missions/:missionId/challenge', checkMissionExists, checkIsNotChallenging)


router.use(checkValidation); // 유효성 검사

router.post('/', handleStoreAdd);
router.post('/:storeId/reviews', handleReviewAdd);
router.post('/:storeId/missions', handleMissionAdd);
router.post('/:storeId/missions/:missionId/challenge', handleChallengeMission)

export default router;