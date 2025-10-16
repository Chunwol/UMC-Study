import express from 'express';

//Middlewares
import checkValidation from '#Middleware/validation/validation.middleware.js';

//Controllers
import { handleUserSignUp, handleUserLogin, handleUserToken } from '#Controller/user.controller.js';

//Validations
import { registerValidation, loginValidation, refreshTokenValidation  } from '#Middleware/validation/user.validation.js';
import { authMiddleware } from '#Middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', registerValidation);
router.post('/login', loginValidation);
router.post('/token', refreshTokenValidation);

router.use(checkValidation);

router.post('/signup', handleUserSignUp);
router.post('/login', handleUserLogin);
router.post('/token', handleUserToken);

router.use(authMiddleware);

export default router;
