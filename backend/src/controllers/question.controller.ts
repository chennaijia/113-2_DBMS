import { Request, Response } from 'express';
import * as Question from '../models/question.model';
import { AuthReq } from '../middleware/auth';
import { uploadToCloudinary } from '../config/cloudinary'
import { upload } from '../middleware/upload';
import cloudinary  from '../config/cloudinary';
import streamifier from 'streamifier';
import { pool } from '../config/database'; // 確保這裡的 pool 是正確的
import { listQuestionsByBook as getByBook } from '../models/question.model'

export const uploadQuestion = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    console.log('📥 接收到的表單資料:', req.body);
    console.log('🖼️ 接收到的檔案:', req.files);

    const questionBookId = Number(req.body.QuestionBook_ID);
    if (!questionBookId) {
      res.status(400).json({ message: '缺少題本 ID (questionBookId)' });
      return;
    }

    // ✅ 檢查題本是否存在
    const [check] = await pool.query(
      'SELECT 1 FROM question_book WHERE QuestionBook_ID = ?',
      [questionBookId]
    );
    if ((check as any[]).length === 0) {
      res.status(400).json({ message: '指定的題本不存在，請重新選擇 📘❌' });
      return;
    }

    const contentFile = req.files?.['content_pic']?.[0];
    const answerFile = req.files?.['answer_pic']?.[0];

    const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'questions' },
          (error, result) => {
            if (error || !result) {
              console.error('❌ Cloudinary 上傳失敗:', error);
              return reject(error);
            }
            console.log('✅ 圖片成功上傳至 Cloudinary：', result.secure_url);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    };

    const contentPicUrl = contentFile ? await uploadToCloudinary(contentFile) : '';
    const answerPicUrl = answerFile ? await uploadToCloudinary(answerFile) : '';

    const newQuestion = {
      qtype: req.body.qtype,
      content: '',
      content_pic: contentPicUrl,
      answer: req.body.answer,
      answer_pic: answerPicUrl,
      detail_ans: '',
      detail_ans_pic: '',
      subject: '',
      level: 1,
      creator_id: req.user!.id,
      isStar: 0,
    };

    console.log('📤 準備存入資料庫的題目：', newQuestion);

    const id = await Question.createQuestion(newQuestion, questionBookId, req.user!.id); // ✅ 連同題本 ID 傳入
    console.log('✅ 題目成功存入資料庫，ID:', id);

    res.status(201).json({
  id,
  questionImage: contentPicUrl,
  answerImage: answerPicUrl,
  answer: req.body.answer,
  questionType: req.body.qtype,
  note: '',
  question: '',
  starred: false,
  wrongCount: 0,
  rightCount: 0
})

  } catch (error) {
    console.error('❌ 上傳題目錯誤:', error);
    res.status(500).json({ message: '新增題目失敗', error });
  }
};





/*
export const uploadQuestion = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    console.log('📥 接收到的表單資料:', req.body);
    console.log('🖼️ 接收到的檔案:', req.files);

    const contentFile = req.files?.['content_pic']?.[0];
    const answerFile = req.files?.['answer_pic']?.[0];

    const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'questions' },
          (error, result) => {
            if (error || !result) {
              console.error('❌ Cloudinary 上傳失敗:', error);
              return reject(error);
            }
            console.log('✅ 圖片成功上傳至 Cloudinary：', result.secure_url);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    };

    const contentPicUrl = contentFile ? await uploadToCloudinary(contentFile) : '';
    const answerPicUrl = answerFile ? await uploadToCloudinary(answerFile) : '';

    const newQuestion = {
      qtype: req.body.qtype,
      content: '',
      content_pic: contentPicUrl,
      answer: req.body.answer,
      answer_pic: answerPicUrl,
      detail_ans: '',
      detail_ans_pic: '',
      subject: '',
      level: 1,
      creator_id: req.user!.id,
      isStar: 0,
    };

    console.log('📤 準備存入資料庫的題目：', newQuestion);

    const id = await Question.createQuestion(newQuestion, req.body.questionBookId, req.user!.id); // ⬅️ 使用者 ID 來自 middleware
    console.log('✅ 題目成功存入資料庫，ID:', id)
;
    res.status(201).json({ id });
  } catch (error) {
    console.error('❌ 上傳題目錯誤:', error);
    res.status(500).json({ message: '新增題目失敗', error });
  }
};
*/

export const listQuestions = async (req: AuthReq, res: Response) => {
  try {
    console.log('✅ 抓資料使用者 ID:', req.user?.id);

    const questions = await Question.listQuestions(req.user!.id); // ⬅️ 拿使用者 ID
    res.status(200).json(questions); // ⬅️ status 改成 200
  } catch (err) {
    console.error('❌ 抓題目列表錯誤:', err);
    res.status(500).json({ message: '讀取失敗' });
  }
};


export const listQuestionsByBook = async (bookId: number, userId: number) => {
  const [rows]: any = await pool.query(
    `SELECT q.*
     FROM QUESTION q
     JOIN QUESTION_COLLECTION qc ON q.Question_ID = qc.Question_ID
     WHERE qc.QuestionBook_ID = ? AND qc.User_ID = ?
     ORDER BY q.Question_ID DESC`,
    [bookId, userId],
  )
  return rows
}

