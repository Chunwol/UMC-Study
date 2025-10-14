import express from 'express';
import getStatus from '#Util/getStatus.js';
import user from '#Router/user.router.js';
import authMiddleware from '#Middleware/auth.middleware.js';


const router = express.Router();
router.get('/status', getStatus);

router.use('/user', user);

router.use(authMiddleware);

export default router;