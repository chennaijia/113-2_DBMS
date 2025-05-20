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
    const { month } = req.query;

    if (!month || typeof month !== 'string') {
      res.status(400).json({ message: '缺少月份' });
      return;
    }

    const records = await getCheckInsByMonth(userId, month);
    const dates = records.map(r => r.date.toISOString().split('T')[0]);

    res.json(dates);
  } catch (err) {
    console.error('❌ 取得打卡紀錄失敗:', err);
    res.status(500).json({ message: '取得打卡紀錄失敗' });
  }
};



