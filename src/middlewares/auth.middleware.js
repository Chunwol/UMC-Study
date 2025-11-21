import { getUserFromId } from '#Repository/user.repository.js';
import jwt from 'jsonwebtoken';
import CustomError from '#Middleware/error/customError.js';

//인증 미들웨어
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new CustomError({ name: 'TOKEN_EXPIRED' }));
  }

  try {
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
const user = await getUserFromId(decoded.userId);

    if (!user) {
        return next(new CustomError({ name: 'USER_NOT_FOUND' }));
    }
    req.user = user;
    return next();
  } catch (error) {
    switch (error.name) {
      case 'TokenExpiredError':
        return next(new CustomError({ name: 'TOKEN_EXPIRED' })); //토큰이 만료되었습니다.
      case 'JsonWebTokenError':
        return next(new CustomError({ name: 'INVALID_TOKEN' })); //유효하지 않은 토큰입니다.
      default:
        console.error('인증 미들웨어 에러:', error);
        return next(new CustomError({ name: 'UNHANDLED_ERROR' }));
    }
  }
};

//선택적 인증 미들웨어
export const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
        return next();
    }

  try {
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
const user = await getUserFromId(decoded.userId);

    if (!user) {
        return next();
    }
    req.user = user;
    return next();
  } catch (error) {
    return next();
  }
};