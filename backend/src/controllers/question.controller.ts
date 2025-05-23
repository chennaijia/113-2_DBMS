import { Request, Response } from 'express';
import * as Question from '../models/question.model';
import { AuthReq } from '../middleware/auth';
import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';
import { pool } from '../config/database'; // 確保這裡的 pool 是正確的
import { listQuestionsByBook as getByBook,
        getRandomPracticeQuestions,
        getMostWrongQuestions as getMostWrongQuestionsModel,
        getQuestionCount as getQuestionCountModel,
        judgeAndUpdate
      } from '../models/question.model'

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

//viewQuestion取得該使用者題目列表
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

//viewQuestion取得題本中的題目
export const listQuestionsByBook = async (req: AuthReq, res: Response) => {
  try {
    const bookId = +req.params.bookId
    const userId = req.user!.id
    const rows = await getByBook(bookId, userId)
    res.status(200).json(rows)
  } catch (err) {
    console.error('❌ listQuestionsByBook 失敗：', err)
    res.status(500).json({ message: '讀取題目失敗' })
  }
}

//viewQuestion刪除題目
export const deleteQuestion = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const id = +req.params.id
    const userId = req.user!.id

    const [rows]: any = await pool.query(
      'SELECT * FROM QUESTION_COLLECTION WHERE Question_ID = ? AND User_ID = ?',
      [id, userId]
    )

    if (rows.length === 0) {
      res.status(403).json({ message: '無權限刪除此題' })
      return
    }

    await pool.query('DELETE FROM QUESTION_COLLECTION WHERE Question_ID = ?', [id])
    await pool.query('DELETE FROM QUESTION WHERE Question_ID = ?', [id])

    // ✅ 刪除題目時，更新題本的題目數量
    await pool.query(
      `UPDATE QUESTION_BOOK
       SET Question_Count = Question_Count - 1
       WHERE QuestionBook_ID = ? AND Creator_ID = ?`,
      [rows[0].QuestionBook_ID, userId] // 只需要這兩個參數
    )

    res.status(200).json({ message: '刪除成功' }) // ✅ 不要 return
  } catch (err) {
    console.error('❌ 刪除題目失敗:', err)
    res.status(500).json({ message: '刪除失敗' })
  }
}

//viewQuestion更新星號狀態
export const toggleStar = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const id = +req.params.id
    const userId = req.user!.id
    const { isStar } = req.body

    if (typeof isStar !== 'boolean') {
      res.status(400).json({ message: 'isStar 必須是布林值' })
      return
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM QUESTION_COLLECTION WHERE Question_ID = ? AND User_ID = ?',
      [id, userId]
    )

    if (rows.length === 0) {
      res.status(403).json({ message: '無權限修改此題' })
      return
    }

    await pool.query(
      'UPDATE QUESTION SET isStar = ? WHERE Question_ID = ?',
      [isStar ? 1 : 0, id]
    )

    res.status(200).json({ message: '已更新星號狀態', isStar })
  } catch (err) {
    console.error('❌ 更新星號失敗:', err)
    res.status(500).json({ message: '更新失敗' })
  }
}

//viewQuestion更新筆記
export const updateNote = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const id = +req.params.id
    const userId = req.user!.id
    const { note } = req.body

    // ✅ 檢查使用者是否有修改權限
    const [rows]: any = await pool.query(
      'SELECT 1 FROM QUESTION WHERE Question_ID = ? AND Creator_ID = ?',
      [id, userId]
    )

    if (rows.length === 0) {
      res.status(403).json({ message: '無權限修改此題' })
      return
    }

    // ✅ 正確更新 Content 欄位
    await pool.query(
      'UPDATE QUESTION SET Content = ? WHERE Question_ID = ?',
      [note, id]
    )

    res.status(200).json({ message: '筆記已更新', note })
  } catch (err) {
    console.error('❌ 筆記更新失敗:', err)
    res.status(500).json({ message: '更新筆記失敗' })
  }
}

//主頁面每日題目練習
export const getRandomQuestion = async (req: AuthReq, res: Response): Promise<void> => {
  const userId = req.user!.id


  try {
    const [rows]: any = await pool.query(
      `SELECT q.*
       FROM QUESTION q
       JOIN QUESTION_COLLECTION qc ON q.Question_ID = qc.Question_ID
       WHERE qc.User_ID = ?
       ORDER BY RAND()
       LIMIT 1`,
      [userId]
    )

    if (rows.length === 0) {
      res.status(404).json({ message: '找不到任何題目' }) // ✅ 一定要 res 結束
      return
    }

    res.status(200).json(rows[0]) // ✅ 明確 res 回應
  } catch (err) {
    console.error('❌ 抽題失敗:', err)
    res.status(500).json({ message: '伺服器錯誤' }) // ✅ 捕捉錯誤並回應
  }
}

//練習錯題隨機錯題模式
export const getRandomWrongQuestions = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    console.log('✅ 抓資料使用者 ID:', req.user?.id);

    const { bookId, count } = req.query
    const userId = req.user!.id // ✅ 從 token 中取 userId

    if (!bookId || !count) {
      res.status(400).json({ message: '缺少參數：bookId 或 count' })
      return
    }

    const questions = await getRandomPracticeQuestions(
      Number(bookId),
      userId,
      Number(count)
    )

    res.json(questions) // ✅ 不要 return
  } catch (error) {
    console.error('取得隨機錯題失敗:', error)
    res.status(500).json({ message: '伺服器錯誤，無法取得題目' })
  }
}

//練習錯題隨機錯最多模式
export const getMostWrongQuestions = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const { bookId, count } = req.query
    const userId = req.user!.id // ✅ 從 token 中取 userId

    if (!bookId || !count) {
      res.status(400).json({ message: '缺少參數 bookId 或 count' })
      return
    }

    const questions = await getMostWrongQuestionsModel(
      Number(bookId),
      userId,
      Number(count)
    )

    res.status(200).json(questions)
  } catch (error) {
    console.error('取得錯最多題目失敗:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
}

//該使用者練習題本題目數量
export const getQuestionCount = async (req: AuthReq, res: Response): Promise<void> => {

  try {
    console.log('✅ 抓資料使用者 ID:', req.user?.id);

    const bookId = +req.params.bookId
    const userId = req.user!.id

    if (isNaN(bookId)) {
      res.status(400).json({ message: 'bookId 必須是數字' })
      return
    }

    const count = await getQuestionCountModel(bookId, userId)
    res.status(200).json({ count })
  } catch (err) {
    console.error('❌ getQuestionCount 失敗：', err)
    res.status(500).json({ message: '讀取題目數量失敗' })
  }
}

export const submitAnswer = async (req: AuthReq, res: Response): Promise<void> => {
  const qid   = Number(req.params.id);
  const ans   = (req.body.answer ?? '').toString().trim();
  const uid   = req.user!.id;          // middleware 已驗證

  if (!qid || !ans) {
   res.status(400).json({ message: '缺少題號或答案' });
  }

  try {
    const { correct, practice, wrong } = await judgeAndUpdate(qid, ans, uid);
    res.status(200).json({
      message: correct ? '答對 🎉' : '答錯 😢',
      correct,
      practiceCount: practice,
      errCount: wrong
    });
  } catch (err) {
    console.error('❌ 提交答案失敗:', err);
    res.status(500).json({ message: '提交答案失敗' });
  }
}

export const updateQuestionHandler = async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const id = +req.params.id;
    const userId = req.user!.id;

    // 權限檢查
    const [rows]: any = await pool.query(
      'SELECT Creator_ID FROM QUESTION WHERE Question_ID = ?',
      [id]
    );
    if (rows.length === 0 || rows[0].Creator_ID !== userId) {
      res.status(403).json({ message: '無權限修改此題' });
      return;
    }

    // 處理圖片上傳 (同 uploadQuestion)
    const uploads: Partial<{
      content_pic: string;
      answer_pic: string;
      detail_ans_pic: string;
    }> = {};
    const files = req.files as Record<string, Express.Multer.File[]>;

    for (const field of ['content_pic','answer_pic','detail_ans_pic'] as const) {
      if (files?.[field]?.[0]) {
        const stream = streamifier.createReadStream(files[field][0].buffer);
        const uploadResult: any = await new Promise((resolve, reject) => {
          const cld_upload_stream = cloudinary.uploader.upload_stream(
            { folder: 'questions' },
            (error, result) => error ? reject(error) : resolve(result)
          );
          stream.pipe(cld_upload_stream);
        });
        uploads[field] = (uploadResult as any).secure_url;
      }
    }

    const { answer, note } = req.body;
    await Question.updateQuestion(id, {
      Content_pic: uploads.content_pic,
      Answer: answer,
      Answer_pic: uploads.answer_pic,
      DetailAns_pic: uploads.detail_ans_pic,
      Content: note,    // 把筆記對應到 Content 欄
    });

    res.status(200).json({ message: '題目已更新' });
  } catch (err) {
    console.error('❌ 題目更新失敗:', err);
    res.status(500).json({ message: '更新題目失敗' });
  }
};
