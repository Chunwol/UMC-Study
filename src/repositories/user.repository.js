import { pool } from "../db.config.js";
import { getRegionIdFromCode } from '#Repository/region.repository.js';
import bcrypt from 'bcrypt';
import CustomError from '#Middleware/error/customError.js';

// User 데이터 삽입
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
    const newUserId = result.insertId; // 방금 생성된 사용자의 ID

    if (data.terms && data.terms.length > 0) {
      const termsValues = data.terms.map((term) => [
        newUserId,
        term.termId,
        term.isAgreed,
      ]);
      await conn.query(
        `INSERT INTO user_term (user_id, term_id, is_agreed) VALUES ?;`,
        [termsValues] // 2차원 배열을 한 번에 삽입
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

// 사용자 정보 얻기
export const getUserFromId = async (userId) => {
  const conn = await pool.getConnection();

  try {
    const [user] = await conn.query(`SELECT * FROM user WHERE id = ?;`, userId);

    //console.log(user);

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

export const getUserIdPwFromEmail = async (email) => {
  const conn = await pool.getConnection();

  try {
    const [user] = await conn.query(`SELECT * FROM user WHERE email = ?;`, email);

    //console.log(user);

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

export const getUserIdFromToken = async (token) => {
  const conn = await pool.getConnection();
  try {
    const [user] = await conn.query(`SELECT * FROM user WHERE refresh_token = ?;`, token);

    //console.log(user);

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

// 음식 선호 카테고리 매핑
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

// // 사용자 선호 카테고리 반환 미완
// export const getUserFromIdPreferencesByUserId = async (userId) => {
//   const conn = await pool.getConnection();

//   try {
//     const [preferences] = await pool.query(
//       "SELECT ufc.id, ufc.food_category_id, ufc.user_id, fcl.name " +
//         "FROM user_favor_category ufc JOIN food_category fcl on ufc.food_category_id = fcl.id " +
//         "WHERE ufc.user_id = ? ORDER BY ufc.food_category_id ASC;",
//       userId
//     );

//     return preferences;
//   } catch (err) {
//     throw new Error(
//       `오류가 발생했어요. 요청 파라미터를 확인해주세요. (${err})`
//     );
//   } finally {
//     conn.release();
//   }
// };