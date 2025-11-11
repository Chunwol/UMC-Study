import { body, param, query } from 'express-validator';
import CustomError from '#Middleware/error/customError.js';
import { email, password, refreshToken } from '#Util/pattern.js';

//회원가입 검증
export const registerValidation = [
  body('email')
    .exists().withMessage('이메일은 필수입니다.')
    .isString()
    .matches(email).withMessage('이메일 형식이 올바르지 않습니다.'),

  body('password')
    .exists().withMessage('비밀번호는 필수입니다.')
    .isString()
    .matches(password).withMessage('비밀번호 형식이 올바르지 않습니다.'),

  body('name')
    .exists().withMessage('이름은 필수입니다.')
    .isString().notEmpty(),

  body('gender')
    .exists().withMessage('성별은 필수입니다.')
    .isIn(['male', 'female']).withMessage('성별은 male 또는 female 이어야 합니다.'),

  body('birthday')
    .exists().withMessage('생년월일은 필수입니다.')
    .isISO8601().withMessage('날짜 형식(YYYY-MM-DD)이 올바르지 않습니다.'),

  body('addressCode')
    .exists().withMessage('주소코드는 필수입니다.')
    .isString()
    .isLength({ min: 10, max: 10 }).withMessage('주소코드는 10자리여야 합니다.')
    .matches(/^\d+$/).withMessage('주소코드는 숫자만 포함해야 합니다.'),

  body('addressDetail')
    .optional()
    .isString(),

  body('terms')
    .exists().withMessage('약관 동의 정보는 필수입니다.')
    .isArray({ min: 1 }).withMessage('약관 동의 정보가 배열 형태여야 합니다.')
    .custom((terms) => {
      return terms.every(
        (t) =>
          typeof t.termId === 'number' &&
          typeof t.isAgreed === 'boolean'
      );
    }).withMessage('terms 배열의 각 요소는 { termId: number, isAgreed: boolean } 형태여야 합니다.'),

  body('favoriteFoodIds')
    .optional()
    .isArray()
    .custom((arr) => arr.every((id) => typeof id === 'number'))
    .withMessage('favoriteFoodIds는 숫자 배열이어야 합니다.'),
];

//로그인 검증
export const loginValidation = [
  body('email')
    .exists().withMessage('email 필드는 필수입니다.')
    .isString().withMessage('email은 문자열이어야 합니다.')
    .matches(email).withMessage('유효한 이메일 형식이 아닙니다.'),

  body('password')
    .exists().withMessage('password 필드는 필수입니다.')
    .isString().withMessage('password는 문자열이어야 합니다.')
    .matches(password).withMessage('비밀번호는 8~20자의 영문과 숫자 조합이어야 합니다.'),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .exists().withMessage('refreshToken 필드는 필수입니다.')
    .isString().withMessage('refreshToken은 문자열이어야 합니다.')
    .matches(refreshToken).withMessage('refreshToken 형식이 올바르지 않습니다.'),
];

//유저 ID 파라미터 검증
export const validateUserIdParam = [
    param('userId')
        .isInt({ min: 1 }).withMessage('유저 ID(userId)는 1 이상의 숫자여야 합니다.')
        .toInt()
];