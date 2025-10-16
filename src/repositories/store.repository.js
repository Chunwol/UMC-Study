import { pool } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';

//가게 생성
export const addStoreAndDetails = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { coreData, photos, hours } = data;

    const [storeResult] = await conn.query(
      `INSERT INTO store (user_id, region_id, name, industry, address_detail) VALUES (?, ?, ?, ?, ?);`,
      [
        coreData.userId,
        coreData.regionId,
        coreData.name,
        coreData.industry,
        coreData.addressDetail,
      ]
    );
    const newStoreId = storeResult.insertId;

    if (photos && photos.length > 0) {
      const photoValues = photos.map(link => [newStoreId, link]);
      await conn.query(
        `INSERT INTO store_photo (store_id, link) VALUES ?;`,
        [photoValues]
      );
    }

    if (hours && hours.length > 0) {
        const hourValues = hours.map(h => [newStoreId, h.day_of_week, h.open_time, h.close_time]);
        await conn.query(
            `INSERT INTO store_hours (store_id, day_of_week, open_time, close_time) VALUES ?;`,
            [hourValues]
        );
    }

    await conn.commit();
    
    return { id: newStoreId, ...coreData };

  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
        throw new CustomError({ name: 'BAD_REQUEST', message: '해당 사용자는 이미 가게를 등록했습니다.' });
    }
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  } finally {
    conn.release();
  }
};

//가게 존재여부 확인
export const isStoreExist = async (storeId) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            `SELECT EXISTS(SELECT 1 FROM store WHERE id = ?) as isExist;`,
            storeId
        );
        return rows[0].isExist;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
};

//유저ID로 가게ID검색
export const getOwnerIdFromStoreId = async (storeId) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            `SELECT user_id FROM store WHERE id = ?;`,
            [storeId]
        );
        return rows.length > 0 ? rows[0].user_id : null;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
}

//별점 매기기
export const updateStoreStarRating = async (storeId, conn) => {
    const connection = conn || await pool.getConnection();
    try {
        await connection.query(
            `UPDATE store s
             SET s.star_rating = COALESCE((SELECT AVG(sr.star_rating) FROM store_review sr WHERE sr.store_id = s.id), 0.0)
             WHERE s.id = ?;`,
            [storeId]
        );
        
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR', message: '가게 별점 업데이트 중 오류가 발생했습니다.' });
    } finally {
        if (!conn) {
            connection.release();
        }
    }
};