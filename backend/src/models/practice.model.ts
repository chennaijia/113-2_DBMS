import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface PracticeQuestionRecord {
  Rquestion_Id: number;
  user_answer: string;
  is_correct: boolean;
}


interface ReviewTestInput {
  total_qCount: number;
  err_qCount: number;
  accuracy: number;
  time_spent: number;
  practiced_at?: string;
  questions: PracticeQuestionRecord[];
}

export const createReviewTestWithRecords = async (data: ReviewTestInput) => {
  const review_test_id = await insertReviewTest(data);
  await insertReviewQuestionRecords(review_test_id, data.questions);
  await updateQuestionStats(data.questions);
  return { review_test_id };
};


//插入一筆review_test記錄
export const insertReviewTest = async (data: ReviewTestInput) => {
  const [result] = await pool.query(
    `INSERT INTO REVIEW_TEST (total_qCount, err_qCount, accuracy, time_spent, practiced_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.total_qCount,
      data.err_qCount,
      data.accuracy,
      data.time_spent,
      data.practiced_at || new Date(),
    ]
  );
  return (result as any).insertId;
};

//插入多筆review_question_record記錄
export const insertReviewQuestionRecords = async (
  review_test_id: number,
  questions: PracticeQuestionRecord[]
) => {
  const values = questions.map((q) => [
    review_test_id,
    q.Rquestion_Id,
    q.user_answer,
    q.is_correct,
  ]);
  await pool.query(
    `INSERT INTO REVIEW_QUESTION_RECORD
     (review_test_Id, Rquestion_Id, user_answer, is_correct)
     VALUES ?`,
    [values]
  );
};

// 更新題目的練習次數和錯誤次數
export const updateQuestionStats = async (questions: PracticeQuestionRecord[]) => {
  const allIds = questions.map((q) => q.Rquestion_Id);
  const wrongIds = questions.filter(q => q.is_correct === false).map(q => q.Rquestion_Id);

  await pool.query(
    `UPDATE QUESTION SET practiceCount = practiceCount + 1
     WHERE Question_id IN (${allIds.map(() => '?').join(',')})`,
    allIds
  );

  if (wrongIds.length > 0) {
    await pool.query(
      `UPDATE QUESTION SET errCount = errCount + 1
       WHERE Question_id IN (${wrongIds.map(() => '?').join(',')})`,
      wrongIds
    );
  }
};



/*
export const createReviewTestWithRecords = async (data: ReviewTestInput) => {
  // 1️⃣ 先插入 review_tests
  const [result] = await pool.query(
    `INSERT INTO REVIEW_TEST (total_qCount, err_qCount, accuracy, time_spent, practiced_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.total_qCount,
      data.err_qCount,
      data.accuracy,
      data.time_spent,
      data.practiced_at || new Date(),
    ]
  );

  // 取得剛插入的 review_test_id
  const review_test_id = (result as any).insertId;

  // 2️⃣ 插入每一筆題目記錄
  const values = data.questions.map((q) => [
    review_test_id,
    q.Rquestion_Id,
    q.user_answer,
    q.is_correct,
  ]);

  await pool.query(
    `INSERT INTO REVIEW_QUESTION_RECORD
     (review_test_Id, Rquestion_Id, user_answer, is_correct)
     VALUES ?`,
    [values]
  );

  return { review_test_id };
};*/
