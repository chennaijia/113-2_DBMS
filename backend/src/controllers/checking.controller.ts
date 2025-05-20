import { Request, Response } from 'express'
import { AuthReq } from '../middleware/auth'
import {pool} from '../config/database'
import { createCheckIn, getCheckInsByMonth } from '../models/checking.model';


export const postCheckIn = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { date } = req.body;

    await createCheckIn(userId, date);
    res.status(200).json({ message: '打卡成功' }); // ✅ 呼叫，不要 return
  } catch (err) {
    console.error('❌ 打卡失敗:', err);
    res.status(500).json({ message: '打卡失敗' });
  }
};

export const getMonthlyCheckIns = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const month = req.query.month as string; // e.g., '2025-05'

    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') as date
       FROM CHECKING
       WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
      [userId, month]
    );

    const dates = (rows as any[]).map(row => row.date);
    res.status(200).json(dates); // ✅ 回傳 ['2025-05-18', '2025-05-20']
  } catch (err) {
    console.error('❌ 無法取得打卡紀錄:', err);
    res.status(500).json({ message: '查詢打卡紀錄失敗' });
  }
};



