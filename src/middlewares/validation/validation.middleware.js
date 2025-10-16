import { validationResult } from 'express-validator';
import CustomError from '#Middleware/error/customError.js';

//유효성 검사
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(
      new CustomError({
        name: 'BAD_REQUEST',
        message: errorMessages.join(', ') || '유효성 검사 실패',
      })
    );
  }

  next();
};

export default checkValidation;
