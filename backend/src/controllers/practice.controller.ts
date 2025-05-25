import { Request, Response } from 'express';
import { createReviewTestWithRecords } from '../models/practice.model';

export const createReviewTest = async (req: Request, res: Response) => {
  try {
    const result = await createReviewTestWithRecords(req.body);
    res.status(201).json({
      message: '✅ 練習記錄建立成功',
      review_test_id: result.review_test_id,
    });
  } catch (err) {
    console.error('❌ 建立練習記錄失敗:', err);
    res.status(500).json({
      message: '❌ 建立練習記錄時發生錯誤',
    });
  }
};
