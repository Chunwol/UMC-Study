import { pool } from "../db.config.js";
import CustomError from '#Middleware/error/customError.js';

export const getRegionIdFromCode = async (addressCode, conn) => {
  const connection = conn || await pool.getConnection();
  const normalizedCode = addressCode.substring(0, 8) + '00';
  try {
    const [rows] = await connection.query(
      `SELECT id FROM region WHERE code = ?;`, 
      normalizedCode);
    if (rows.length > 0) {
      return rows[0].id;
    } else {
      return null;
    }
  } catch (err) {
    await conn.rollback();
    console.error(err);
    throw new CustomError({ name: 'DATABASE_ERROR' });
  }finally {
    if (!conn) {
      connection.release();
    }
  }
};