import express from 'express';

//Middlewares
import checkValidation from '#Middleware/validation/validation.middleware.js';

//Controllers
import { handleUserSignUp, handleUserLogin, handleUserToken, handleGetMyReviews } from '#Controller/user.controller.js';

//Validations
import { registerValidation, loginValidation, refreshTokenValidation, validateMyReviewsCursorQuery, validateLimitQuery  } from '#Middleware/validation/user.validation.js';
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

// 내가 작성한 리뷰 목록 조회 API
router.get('/reviews',
    authMiddleware,
    validateMyReviewsCursorQuery,
    validateLimitQuery,
    checkValidation,
    handleGetMyReviews
);

export default router;