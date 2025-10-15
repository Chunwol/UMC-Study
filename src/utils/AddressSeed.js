import fs from 'fs';
import { pool } from '../db.config.js'; // DB 설정 파일 경로
import csv from 'csv-parser';

const results = [];

// 1. CSV 파일 읽기
fs.createReadStream('regions.csv') // 4개 열(column)을 가진 CSV 파일
  .pipe(csv({mapHeaders: ({ header }) => header.trim()}))
  .on('data', (data) => {
        if (data.code && data.city) {
        results.push(data);
        }
    })
  .on('end', async () => {
    // 2. DB에 데이터 삽입
    const conn = await pool.getConnection();
    console.log('데이터베이스 시딩을 시작합니다...');

    try {
      await conn.beginTransaction();

      // results 배열에서 4개의 값을 순서대로 배열로 변환
      const values = results.map(r => [r.code, r.city, r.district, r.neighborhood]);
      
      // INSERT 쿼리에 4개의 컬럼 지정
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