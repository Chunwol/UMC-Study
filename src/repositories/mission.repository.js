import { pool } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';

//미션 생성
export const addMission = async (data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        
        const [result] = await conn.query(
            `INSERT INTO mission (store_id, reward, description, deadline) VALUES (?, ?, ?, ?);`,
            [
                data.store_id,
                data.reward,
                data.description,
                data.deadline
            ]
        );

        await conn.commit();
        return { id: result.insertId, ...data };

    } catch (err) {
        await conn.rollback();
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
};

//미션 존재여부 확인
export const isMissionExist = async (missionId) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            `SELECT EXISTS(SELECT 1 FROM mission WHERE id = ?) as isExist;`,
            [missionId]
        );
        return rows[0].isExist;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
};

//미션 도전여부 확인
export const isMissionChallenging = async (userId, missionId) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            `SELECT EXISTS(SELECT 1 FROM user_mission WHERE user_id = ? AND mission_id = ?) as isExist;`,
            [userId, missionId]
        );
        return rows[0].isExist;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
};

//미션 도전하기
export const addUserMission = async (userId, missionId) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query(
            `INSERT INTO user_mission (user_id, mission_id, status) VALUES (?, ?, false);`,
            [userId, missionId]
        );

        await conn.commit();
        return { id: result.insertId, user_id: userId, mission_id: missionId };

    } catch (err) {
        await conn.rollback();
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
};