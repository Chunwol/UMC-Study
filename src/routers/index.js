//Express
import express from 'express';
//Status Check
import getStatus from '#Util/getStatus.js';
//Routers
import user from '#Router/user.router.js';
import store from '#Router/store.router.js';
//Middlewares
import { authMiddleware } from '#Middleware/auth.middleware.js';

const router = express.Router();

router.get('/status', getStatus);

router.use('/user', user);
router.use('/store', store)

router.use(authMiddleware);

export default router;