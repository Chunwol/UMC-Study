import Errors from './errors.js';

class CustomError extends Error {
  constructor({ name, message, description }) {
    const errorInfo = Errors[name] || Errors.UNHANDLED_ERROR;
    super(message || errorInfo.message);
    this.name = name || errorInfo.name || 'Error';
    this.code = errorInfo.code;
    this.description = description || errorInfo.description;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export default CustomError;
