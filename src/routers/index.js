//Express
import express from 'express';
//Status Check
import getStatus from '#Util/getStatus.js';
//Routers
import user from './user.router.js'; 
import store from './store.router.js';
//Middlewares
import { authMiddleware } from '#Middleware/auth.middleware.js';

const router = express.Router();

router.get('/status', 
    /* #swagger.summary = '서버 상태 확인'
       #swagger.responses[200] = { type: "string", example: "2025-11-22" }
    */
   getStatus
);

router.use('/user', user);
router.use('/store', store)

router.use(authMiddleware);

export default router;