import multer from 'multer';
import CustomError from '#Middleware/error/customError.js';

const storage = multer.memoryStorage();
//파일 형식 확인
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new CustomError({ name: 'BAD_REQUEST', message: 'jpeg, png, gif 형식의 이미지만 업로드 가능합니다.' }), false);
  }
};

//파일 업로드
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});