import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { updateRefreshToken, getUserIdFromToken } from '#Repository/user.repository.js';
import CustomError from '#Middleware/error/customError.js';

//토큰 생성
export const tokenSign = async (userId) => {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const accessToken = jwt.sign({userId:Number(userId)}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
  await updateRefreshToken(userId, refreshToken);
  return {accessToken, refreshToken};
};

//토큰 갱신
export const tokenReissue = async (Refreshtoken) => {
  const userId = await getUserIdFromToken(Refreshtoken)
  if(!userId){
      throw new CustomError({ name: 'INVALID_TOKEN' }); //폐기된 토큰입니다.
  }
  return await tokenSign(userId);
}