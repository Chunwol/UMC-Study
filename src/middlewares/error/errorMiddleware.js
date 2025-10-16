import Errors from './errors.js';

const ErrorMiddleware = (err, req, res, next) => {
  if (!Errors[err.name]) {
    console.error('정의되지 않은 에러 발생:', err);
  }
  const error = Errors[err.name] || Errors.UNHANDLED_ERROR;
  const name = err.name;
  const description = err.description || (error && error.description) || Errors.Unhandled_Error.description;
  const message = err.message || (error && error.message) || Errors.Unhandled_Error.message;
  const code = (error && error.code) || Errors.Unhandled_Error.code;
  res.status(code).json({
    success: false,
    code,
    name,
    message,
    description,
  });
};

export default ErrorMiddleware;