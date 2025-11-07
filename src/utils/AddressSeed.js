import fs from 'fs';
import { prisma } from '../db.config.js';
import csv from 'csv-parser';

// 전국 주소 데이터 DB저장
const results = [];

fs.createReadStream('regions.csv')
  .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
  .on('data', (data) => {
    if (data.code && data.city) {
      results.push(data);
    }
  })
  .on('end', async () => {
    console.log('데이터베이스 시딩을 시작합니다...');

    try {
      const result = await prisma.region.createMany({
        data: results,
        skipDuplicates: true,
      });
      
      console.log(`${result.count}개의 지역 데이터 시딩이 성공적으로 완료되었습니다.`);

    } catch (err) {
      console.error('데이터베이스 시딩 중 오류가 발생했습니다:', err);
    } finally {
      await prisma.$disconnect();
    }
  });