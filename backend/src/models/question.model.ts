import { pool } from '../config/database';
import { ResultSetHeader } from 'mysql2';

export interface QuestionInput {
  qtype: string;
  content: string;
  content_pic?: string;
  answer?: string;
  answer_pic?: string;
  detail_ans?: string;
  detail_ans_pic?: string;
  subject?: string;
  level: number;
  creator_id: number;
  isStar?: number; // 是否為收藏題目，預設值為 0
}


/**
 * 建立題目，並自動加入到指定的題本（關聯表）
 */
export const createQuestion = async (
  q: QuestionInput,
  questionBookId: number,
  userId: number
): Promise<number> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO question
     (QType, Content, Content_pic, Answer, Answer_pic, DetailAns, DetailAns_pic, Subject, Level, Creator_id, isStar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      q.qtype,
      q.content || '',
      q.content_pic || null,
      q.answer || '',
      q.answer_pic || null,
      q.detail_ans || '',
      q.detail_ans_pic || null,
      q.subject || '',
      q.level,
      q.creator_id,
      q.isStar || 0,
    ]
  );

  const questionId = result.insertId;

  // 🧩 插入關聯表
  await pool.query(
    `INSERT INTO QUESTION_COLLECTION (QuestionBook_ID, Question_ID, User_ID, Error_Count, isReview)
     VALUES (?, ?, ?, 0, 0)`,
    [questionBookId, questionId, userId]
  );

  //更新題本的題目數量
  await pool.query(
    `UPDATE QUESTION_BOOK
   SET Question_Count = Question_Count + 1
   WHERE QuestionBook_ID = ? AND Creator_ID = ?`,
    [questionBookId, userId] // 只需要這兩個參數
  );

  return questionId;
};


export const listQuestions = async (creatorId: number) => {
  const [rows]: any = await pool.query(`
    SELECT * FROM question WHERE Creator_id = ? ORDER BY question_id DESC
  `, [creatorId]);
  return rows;
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






