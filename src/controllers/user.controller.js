import passport from 'passport';
//Http Status Code
import { StatusCodes } from "http-status-codes";
//Dto
import { bodyToUser, bodyToToken, responseFromSocialLogin, responseFromUserInfoUpdate } from "#Dto/user.dto.js";
//Service
import { userSignUp, updateSocialUserInfo } from "#Service/user.service.js";
import { tokenReissue, tokenSign } from "#Service/auth.service.js";

// 로그인
export const handleUserLogin = (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) return next(err);
        
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                resultType: "FAIL", 
                error: { errorCode: "LOGIN_FAILED", message: info.message || '로그인 실패' },
                success: null
            });
        }

        const tokens = await tokenSign(user.id);
        return res.status(StatusCodes.OK).success(tokens);
        
    })(req, res, next);
};

export const handleGoogleLoginCallback = async (req, res, next) => {
    try {
        const user = req.user;
        const tokens = await tokenSign(user.id);
        const responseData = responseFromSocialLogin(tokens, user);

        res.status(StatusCodes.OK).success(responseData);

    } catch (err) {
        next(err);
    }
};

// 소셜 로그인 후 추가 정보 입력
export const handleSocialRegister = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const updateData = bodyToUserInfoUpdate(req.body);
        const updatedUser = await updateSocialUserInfo(userId, updateData);

        res.status(StatusCodes.OK).success(responseFromUserInfoUpdate(updatedUser));
        
    } catch (err) {
        next(err);
    }
};

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

//토큰갱신
export const handleUserToken = async (req, res, next) => {
  try {
    const tokens = await tokenReissue(bodyToToken(req.body));

    res.status(StatusCodes.OK).success(tokens);
  } catch (err) {
    next(err);
  }
};