import express from 'express';

import getStatus from '#Util/getStatus.js';

import user from '#Router/user.router.js';
import store from '#Router/store.router.js';

import { authMiddleware } from '#Middleware/auth.middleware.js';


const router = express.Router();
router.get('/status', getStatus);

router.use('/user', user);
router.use('/store', store)

router.use(authMiddleware);

export default router;