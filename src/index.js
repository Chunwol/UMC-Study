import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import CustomError from '#Middleware/error/customError.js';
import ErrorMiddleware from '#Middleware/error/errorMiddleware.js';
import router from '#Router/index.js';
import { connect } from './db.config.js';
import passport from 'passport'; // 추가
import './auth.config.js'; // Passport 설정 파일 로드

dotenv.config();

const app = express();
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? '*' : /chunwol\.kro\.kr/,
  }));
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '너무 많은 요청을 보냈습니다. 15분 후에 다시 시도해주세요.'
});
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev')); 
app.use(cookieParser()); 

app.use(compression({
  threshold: 512
}));

app.use(passport.initialize());

app.use('/api', router);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
    "/docs",
    swaggerUi.service,
    swaggerUi.setup({}, {
        swaggerOptions: {
            url: "/openapi.json",
        },
    })
);

app.use((req, res, next) => {
  next(new CustomError({ name: 'NOT_FOUND' }));
});

app.use((req, res, next) => {
  res.success = (success) => {
    return res.json({ resultType: "SUCCESS", error: null, success });
  };
  next();
});

app.use(ErrorMiddleware);

const startServer = async () => {
    try {
        await connect(false, true);
        app.listen(port, () => {
            console.log(`서버가 ${port}번 포트에서 성공적으로 실행되었습니다.`);
        });

    } catch (error) {
        console.error("서버 시작 실패: 데이터베이스 연결에 실패했습니다.");
        console.error(error);
        process.exit(1);
    }
};

process.on('uncaughtException', err => {
  console.error(err);
  debug('Caught exception: %j', err);
  process.exit(1);
});

startServer();