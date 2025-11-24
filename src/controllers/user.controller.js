//Http Status Code
import { StatusCodes } from "http-status-codes";
//Dto
import { bodyToUser, bodyToLogin, bodyToToken } from "#Dto/user.dto.js";
//Service
import { userSignUp, userLogin } from "#Service/user.service.js";
import { tokenReissue, tokenSign } from "#Service/auth.service.js";

//회원가입
export const handleUserSignUp = async (req, res, next) => {
  try {
    const userId = await userSignUp(bodyToUser(req.body));
    const tokens = await tokenSign(userId);

    res.status(StatusCodes.CREATED).success(tokens);
  } catch (err) {
    next(err);
  }
};

//로그인
export const handleUserLogin = async (req, res, next) => {
  try {
    const userId = await userLogin(bodyToLogin(req.body));
    const tokens = await tokenSign(userId);

    res.status(StatusCodes.OK).success(tokens);
  } catch (err) {
    next(err);
  }
};

//토큰갱신
export const handleUserToken = async (req, res, next) => {
  try {
    const tokens = await tokenReissue(bodyToToken(req.body));

    res.status(StatusCodes.OK).success(tokens);
  } catch (err) {
    next(err);
  }
};