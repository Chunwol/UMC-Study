import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_CONFIG = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
};



export const pool = mysql.createPool({
    host: DB_CONFIG.DB_HOST || NULL,
    user: DB_CONFIG.DB_USERNAME || NULL,
    port: DB_CONFIG.DB_PORT || NULL,
    database: DB_CONFIG.DB_NAME || NULL, // 데이터베이스 이름
    password: DB_CONFIG.DB_PASSWORD || NULL, // 비밀번호
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const connect = async (exitOnError = false, verbose = false) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query("SELECT 1");
        if (verbose) {
            console.log('데이터베이스와 성공적으로 연결되었습니다.');
        }
    } catch (err) {
        if (verbose) {
            console.error('데이터베이스 연결에 실패했습니다:', err);
        }
        if (exitOnError) {
            process.exit(1);
        }
        throw err; 

    } finally {
        if (connection) {
            connection.release();
        }
    }
};