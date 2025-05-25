import { app } from './app';
import { env } from './config/env';
import { pool } from './config/database';

//import * as dotenv from 'dotenv';
//dotenv.config(); // 使用 .env.cloud 檔案
console.log('🧪 資料庫設定:', env);

// 測試連線（送出一個簡單的 SQL）
pool.query('SELECT * FROM TAG')
  .then((result) => {
    console.log('📋 查詢結果:', result[0]);  // 印出資料列
    console.log('✅ 成功連接到資料庫');
    app.listen(env.PORT, () => {
      console.log(`🚀 API running on http://localhost:${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ 資料庫連線失敗：', err);
    console.log('資料庫設定', env);
  });

