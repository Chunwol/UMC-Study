import passport from 'passport';
import CustomError from '#Middleware/error/customError.js';

// 필수 인증
export const authMiddleware = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err);
        
        if (!user) {
            return next(new CustomError({ name: 'UNAUTHORIZED', message: '로그인이 필요합니다.' }));
        }
        
        req.user = user;
        next();
    })(req, res, next);
};

// 선택적 인증
export const optionalAuthMiddleware = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            req.user = null;
            return next();
        }
        req.user = user;
        next();
    })(req, res, next);
};