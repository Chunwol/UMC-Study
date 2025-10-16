import fs from 'fs';
import { pool } from '../db.config.js';
import csv from 'csv-parser';

//전국 주소 세이터 DB저장
const results = [];

fs.createReadStream('regions.csv')
  .pipe(csv({mapHeaders: ({ header }) => header.trim()}))
  .on('data', (data) => {
        if (data.code && data.city) {
        results.push(data);
        }
    })
  .on('end', async () => {
    const conn = await pool.getConnection();
    console.log('데이터베이스 시딩을 시작합니다...');

    try {
      await conn.beginTransaction();

      const values = results.map(r => [r.code, r.city, r.district, r.neighborhood]);
      
      const sql = 'INSERT INTO region (code, city, district, neighborhood) VALUES ?';
      
      await conn.query(sql, [values]);
      await conn.commit();
      
      console.log('데이터베이스 시딩이 성공적으로 완료되었습니다.');

    } catch (err) {
      await conn.rollback();
      console.error('데이터베이스 시딩 중 오류가 발생했습니다:', err);
    } finally {
      conn.release();
      pool.end();
    }
  });