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

export const getRandomPracticeQuestions = async (bookId: number, userId: number, count: number) => {
  const [rows]: any = await pool.query(
    `SELECT q.*
     FROM QUESTION q
     JOIN QUESTION_COLLECTION qc ON q.Question_ID = qc.Question_ID
    WHERE qc.User_ID = ? AND qc.QuestionBook_ID = ?
    ORDER BY RAND()
    LIMIT ?`,
    [userId, bookId, count]
  )
  return rows // ✅ 回傳整包題目
}

export const getMostWrongQuestions = async (bookId: number, userId: number, count: number) => {
  const [rows]: any = await pool.query(
    `SELECT q.*
     FROM QUESTION q
     JOIN QUESTION_COLLECTION qc ON q.Question_ID = qc.Question_ID
    WHERE qc.User_ID = ? AND qc.QuestionBook_ID = ?
    ORDER BY qc.Error_Count DESC
    LIMIT ?`,
    [userId, bookId, count]
  )
  console.log('✅ question.model loaded')

  return rows
}

export const getQuestionCount = async (bookId: number, userId: number) => {
  const [rows]: any = await pool.query(
    `SELECT COUNT(*) AS count
     FROM QUESTION q
     JOIN QUESTION_COLLECTION qc ON q.Question_ID = qc.Question_ID
    WHERE qc.User_ID = ? AND qc.QuestionBook_ID = ?`,
    [userId, bookId]
  )
  console.log('✅ question.model loaded')
  return Number(rows[0].count)
}

interface JudgeResult {
  correct  : boolean;
  practice : number;
  wrong    : number;
}

export const judgeAndUpdate = async (
  qid: number,
  userAns: string,          // 使用者答案
  _uid: number              // 這裡目前用不到，但若之後要記錄個人統計可用
): Promise<JudgeResult> => {

  // 1️⃣  抓正確答案 & 現有統計
  const [rows]: any = await pool.query(
    'SELECT Answer, practiceCount, errCount FROM QUESTION WHERE Question_ID = ?',
    [qid]
  );
  if (!rows.length) throw new Error('找不到題目');

  const correctAns  = rows[0].Answer.toString().trim().toUpperCase();
  const isCorrect   = correctAns === userAns.toUpperCase();

  // 2️⃣  更新統計
  const practiceInc = 1;
  const errInc      = isCorrect ? 0 : 1;

  await pool.execute(
    `UPDATE QUESTION
       SET practiceCount = practiceCount + ?,
           errCount      = errCount      + ?
     WHERE Question_ID = ?`,
    [practiceInc, errInc, qid]
  );

  return {
    correct  : isCorrect,
    practice : rows[0].PracticeCount + practiceInc,
    wrong    : rows[0].Err_Count      + errInc
  };
};

// 新增
export const updateQuestion = async (
  id: number,
  data: {
    Content_pic?: string,
    Answer?: string,
    Answer_pic?: string,
    DetailAns_pic?: string,
    Content?: string,
  }
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.Content_pic !== undefined) {
    fields.push('Content_pic = ?');
    values.push(data.Content_pic);
  }
  if (data.Answer !== undefined) {
    fields.push('Answer = ?');
    values.push(data.Answer);
  }
  if (data.Answer_pic !== undefined) {
    fields.push('Answer_pic = ?');
    values.push(data.Answer_pic);
  }
  if (data.DetailAns_pic !== undefined) {
    fields.push('DetailAns_Pic = ?');
    values.push(data.DetailAns_pic);
  }
  if (data.Content !== undefined) {
    fields.push('Content = ?');
    values.push(data.Content);
  }

  if (fields.length === 0) return;
  values.push(id);
  await pool.query(
    `UPDATE QUESTION SET ${fields.join(', ')} WHERE Question_ID = ?`,
    values
  );
};



