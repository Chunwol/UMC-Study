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
import swaggerAutogen from 'swagger-autogen';
import swaggerUi from 'swagger-ui-express';
import CustomError from '#Middleware/error/customError.js';
import ErrorMiddleware from '#Middleware/error/errorMiddleware.js';
import router from '#Router/index.js';
import { connect } from './db.config.js';
import passport from 'passport';
import './auth.config.js';

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

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup({}, {
        swaggerOptions: {
            url: "/openapi.json",
        },
    })
);

app.get("/openapi.json", async (req, res, next) => {
    const options = {
        openapi: "3.0.0",
        disableLogs: true,
        writeOutputFile: false,
    };
    const outputFile = "/dev/null"; 
    const routes = [
        "./src/routers/index.js", 
    ];
    
    const doc = {
        info: {
            title: "UMC Study API",
            description: "UMC 9기 Node.js 스터디 API 명세서입니다.",
            version: "1.0.0",
        },
        host: "localhost:80",
        basePath: "/api",
        schemes: ["http"],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        definitions: {
            SuccessResponse: {
                type: "object",
                properties: {
                    resultType: { type: "string", example: "SUCCESS" },
                    error: { type: "object", nullable: true, example: null },
                    success: { type: "object" }
                }
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    resultType: { type: "string", example: "FAIL" },
                    error: {
                        type: "object",
                        properties: {
                            errorCode: { type: "string", example: "NOT_FOUND" },
                            message: { type: "string", example: "에러 메시지" },
                            description: { type: "string", example: "상세 설명" }
                        }
                    },
                    success: { type: "object", nullable: true, example: null }
                }
            }
        }
    };

    const result = await swaggerAutogen(options)(outputFile, routes, doc);
    res.json(result ? result.data : null);
});

app.use((req, res, next) => {
  res.success = (success) => {
    return res.json({ resultType: "SUCCESS", error: null, success });
  };
  next();
});

app.use(passport.initialize());

app.use('/api', router);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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