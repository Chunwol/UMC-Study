import { getUserFromId } from '#Repository/user.repository.js';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new CustomError({ name: 'TOKEN_EXPIRED' }));
  }

  try {
    const decoded = await jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await getUserFromId(decoded.userId);
    if (!user) {
        return next(new CustomError({ name: 'BAD_REQUEST' }));
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
        return next(new CustomError({ name: 'UNHANDLED_ERROR' }));
    }
  }
};

export default authMiddleware;