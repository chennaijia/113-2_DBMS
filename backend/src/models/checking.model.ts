// backend/src/models/checkin.model.ts
import { pool } from '../config/database';

export const createCheckIn = async (userId: number, date: string) => {
  try {
    await pool.query(
      'INSERT INTO CHECKING (user_id, date) VALUES (?, ?)',
      [userId, date]
    );
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      // 已經打卡過了，不當成錯誤
      console.warn('⚠️ 該使用者今天已打卡');
      return;
    }
    throw err; // 其他錯誤才拋出
  }
};

export const getCheckInsByMonth = async (userId: number, month: string) => {
  const [rows] = await pool.query(
    `SELECT date FROM CHECKING WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
    [userId, month]
  );
  return rows as { date: Date }[];
};
