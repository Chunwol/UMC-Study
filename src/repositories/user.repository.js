import { pool } from "../db.config.js";
import { getRegionIdFromCode } from '#Repository/region.repository.js';
import bcrypt from 'bcrypt';
import CustomError from '#Middleware/error/customError.js';

//유저 추가
export const addUser = async (data) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [confirm] = await conn.query(
      `SELECT EXISTS(SELECT 1 FROM user WHERE email = ?) as isExistEmail;`,
      data.email
    );

    if (confirm[0].isExistEmail) {
      throw new CustomError({ name: 'EMAIL_ALREADY_EXISTS' });
    }

    const regionId = await getRegionIdFromCode(data.addressCode, conn);
    if (!regionId) {
      throw new CustomError({ name: 'BAD_REQUEST', message: '제공된 주소에 해당하는 지역 정보를 찾을 수 없습니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);


    const [result] = await conn.query(
     `INSERT INTO user (email, password, name, gender, birthday, region_id, address_detail, refresh_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.email,
        hashedPassword,
        data.name,
        data.gender,
        data.birthday,
        regionId,
        data.addressDetail,
        null,
      ]
    );
    const newUserId = result.insertId;

    const defaultNickname = `user_${newUserId}`;
    await conn.query(
        `INSERT INTO profile (user_id, nickname, image_url) VALUES (?, ?, ?);`,
        [newUserId, defaultNickname, null]
    );

    if (data.terms && data.terms.length > 0) {
      const termsValues = data.terms.map((term) => [
        newUserId,
        term.termId,
        term.isAgreed,
      ]);
      await conn.query(
        `INSERT INTO user_term (user_id, term_id, is_agreed) VALUES ?;`,
        [termsValues]
      );
    }

    await conn.commit();

    return newUserId;
  } catch (err) {
    await conn.rollback();
    if (err instanceof CustomError) {
        throw err;
    }
    throw new CustomError({ name: 'DATABASE_ERROR' });

  } finally {
    conn.release();
  }
};

//유저ID로 유저검색
export const getUserFromId = async (userId) => {
  const conn = await pool.getConnection();

  try {
    const [user] = await conn.query(`SELECT * FROM user WHERE id = ?;`, userId);

    if (user.length == 0) {
      return null;
    }

    return user;
  } catch (err) {
    await conn.rollback();
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  } finally {
    conn.release();
  }
};

//email로 UserID와PW을 검색
export const getUserIdPwFromEmail = async (email) => {
  const conn = await pool.getConnection();

  try {
    const [user] = await conn.query(`SELECT * FROM user WHERE email = ?;`, email);

    if (user.length == 0) {
      return null;
    }

    return {id:user[0].id, password:user[0].password};
  } catch (err) {
    await conn.rollback();
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  } finally {
    conn.release();
  }
};

//RefreshToken으로 유저ID검색
export const getUserIdFromToken = async (token) => {
  const conn = await pool.getConnection();
  try {
    const [user] = await conn.query(`SELECT * FROM user WHERE refresh_token = ?;`, token);

    if (user.length == 0) {
      return null;
    }

    return user[0].id;
  } catch (err) {
    await conn.rollback();
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  } finally {
    conn.release();
  }
};

//유저ID로 프로필ID검색
export const getProfileIdFromUserId = async (userId) => {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query(
            `SELECT id FROM profile WHERE user_id = ?;`,
            [userId]
        );
        return rows.length > 0 ? rows[0].id : null;
    } catch (err) {
        console.error(err);
        throw new CustomError({ name: 'DATABASE_ERROR' });
    } finally {
        conn.release();
    }
}

//좋아하는 음식 설정
export const setfavoriteFood = async (userId, foodId) => {
  const conn = await pool.getConnection();

  try {
    await conn.query(
      `INSERT INTO user_favorite (food_id, user_id) VALUES (?, ?);`,
      [foodId, userId]
    );

    await conn.commit();

    return;
  } catch (err) {
    await conn.rollback();
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  } finally {
    conn.release();
  }
};

//RefreshToken 업데이트
export const updateRefreshToken = async (userId, refreshToken) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `UPDATE user SET refresh_token = ? WHERE id = ?;`,
      [refreshToken, userId]
    );

    await conn.commit();
    return result.affectedRows > 0;

  } catch (err) {
    await conn.rollback();
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });

  } finally {
    conn.release();
  }
};