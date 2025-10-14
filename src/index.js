import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import CustomError from '#Middleware/error/customError.js';
import ErrorMiddleware from '#Middleware/error/errorMiddleware.js';
import router from '#Router/index.js';
import { connect } from './db.config.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? '*' : /chunwol\.kro\.kr/,
  }));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use('/api', router);

app.use((req, res, next) => {
  next(new CustomError({ name: 'NOT_FOUND' }));
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