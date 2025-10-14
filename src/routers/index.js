import express from 'express';
import getStatus from '#Util/getStatus.js';
import user from '#Router/user.router.js';

// token
import getUserFromIdFromToken from '#Middleware/user/jwt/getUserFromIdFromToken.js';
import verifyToken from '#Middleware/user/jwt/verifyToken.js';


const router = express.Router();
router.get('/status', getStatus);

router.use('/user', user);

router.use(verifyToken, getUserFromIdFromToken);

export default router;