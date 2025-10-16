import { StatusCodes } from "http-status-codes";
import { bodyToUser, bodyToLogin, bodyToToken } from "../dtos/user.dto.js";
import { userSignUp, userLogin } from "#Service/user.service.js";
import { tokenReissue, tokenSign } from "#Service/auth.service.js";

//회원가입
export const handleUserSignUp = async (req, res, next) => {
  try {
    // console.log("회원가입을 요청했습니다!");
    // console.log("body:", req.body);
    const userId = await userSignUp(bodyToUser(req.body));
    const tokens = await tokenSign(userId);

    res.status(StatusCodes.CREATED).json({ "status": "success", data: tokens });
  } catch (err) {
    next(err);
  }
};

//로그인
export const handleUserLogin = async (req, res, next) => {
  try {
    // console.log("로그인을 요청했습니다!");
    // console.log("body:", req.body);
    const userId = await userLogin(bodyToLogin(req.body));
    const tokens = await tokenSign(userId);

    res.status(StatusCodes.OK).json({ "status": "success", data: tokens });
  } catch (err) {
    next(err);
  }
};

//토큰갱신
export const handleUserToken = async (req, res, next) => {
  try {
    // console.log("토큰 갱신 요청했습니다!");
    // console.log("body:", req.body);
    const tokens = await tokenReissue(bodyToToken(req.body));

    res.status(StatusCodes.OK).json({ "status": "success", data: tokens });
  } catch (err) {
    next(err);
  }
};