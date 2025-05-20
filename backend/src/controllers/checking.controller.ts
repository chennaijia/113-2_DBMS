import { Request, Response } from 'express';
import { AuthReq } from '../middleware/auth';
import { pool } from '../config/database';

export const createCheckIn = async (req: AuthReq, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date } = req.body;

    // 防呆：日期格式檢查
    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ message: '請提供正確的日期格式 (YYYY-MM-DD)' });
    }

    // 嘗試新增打卡紀錄
    await pool.query(
      `INSERT INTO checkins (user_id, date) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE date = date`,  // 不重複插入
      [userId, date]
    );

    res.status(200).json({ message: '打卡成功' });
  } catch (err) {
    console.error('❌ 打卡失敗:', err);
    res.status(500).json({ message: '打卡失敗' });
  }
};


export const getCheckInsByMonth = async (req: AuthReq, res: Response) => {
  try {
    const userId = req.user!.id;
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month as string)) {
      return res.status(400).json({ message: '請提供正確的月份格式 (YYYY-MM)' });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const [rows]: any = await pool.query(
      `SELECT date FROM CHECKING
       WHERE user_id = ? AND date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
    );

    const dates = rows.map((row: any) => row.date.toISOString().slice(0, 10));
    res.status(200).json(dates);
  } catch (err) {
    console.error('❌ 讀取打卡紀錄失敗:', err);
    res.status(500).json({ message: '讀取失敗' });
  }
};

