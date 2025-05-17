import { Request, Response } from 'express';
import * as Question from '../models/question.model';
import { AuthReq } from '../middleware/auth';
import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';

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
      qtype2: '',
      subject: '',
      level: 1,
      creator_id: req.user!.id,
    };

    console.log('📤 準備存入資料庫的題目：', newQuestion);

    const id = await Question.createQuestion(newQuestion);
    res.status(201).json({ id });
  } catch (error) {
    console.error('❌ 上傳題目錯誤:', error);
    res.status(500).json({ message: '新增題目失敗', error });
  }
};

export const listQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await Question.listQuestions();
    res.json(questions);
  } catch (err) {
    console.error('❌ 抓題目列表錯誤:', err);
    res.status(500).json({ message: '讀取失敗' });
  }
};

