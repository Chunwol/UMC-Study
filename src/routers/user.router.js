import express from 'express';

//Middlewares
import checkValidation from '#Middleware/validation/validation.middleware.js';

//Controllers
import { handleUserSignUp, handleUserLogin, handleUserToken } from '#Controller/user.controller.js';

//Validations
import { registerValidation, loginValidation, refreshTokenValidation  } from '#Middleware/validation/user.validation.js';
import { authMiddleware } from '#Middleware/auth.middleware.js';

const router = express.Router();

// 회원가입 API
router.post('/signup',
    registerValidation,
    checkValidation,
    handleUserSignUp
);

// 로그인 API
router.post('/login',
    loginValidation,
    checkValidation,
    handleUserLogin
);

// 토큰 갱신 API
router.post('/token',
    refreshTokenValidation,
    checkValidation,
    handleUserToken
);

export default router;