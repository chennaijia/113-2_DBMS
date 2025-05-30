import * as dotenv from 'dotenv'

//dotenv.config();
dotenv.config({ path: '.env.cloud' })

export const env = {
  PORT: +(process.env.PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: +(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',
  DB_NAME: process.env.DB_NAME || 'wrongbook',
}

//console.log('✅ env.DB_PASS', env.DB_PASS);
console.log('✅ 正在使用 .env.cloud 設定', env)
