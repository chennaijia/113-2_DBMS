import mysql from 'mysql2/promise';
import { env } from './env';

console.log('📦 使用雲端資料庫設定：', {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  database: env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false, // 🔐 Aiven 要求加密連線
  },
});




/*import mysql from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool(
  {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
*/
