import { pool } from '../config/database';

interface QBInput {
  BName: string;
  Question_Count?: number;
  Icon?: string;
  Creator_ID: number;
}

import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function createQB(input: QBInput) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO QUESTION_BOOK (BName, Icon, Creator_ID)
     VALUES (?, ?, ?)`,
    [
      input.BName,
      input.Icon ?? null,
      input.Creator_ID            // ← 這裡一定是 number，不可 undefined
    ],
  );
  return (result as ResultSetHeader).insertId;
}

export const listQBByUser = async (userId: number) => {
  console.log('🎒userId:', userId);
  const [rows] = await pool.query(
    'SELECT * FROM QUESTION_BOOK WHERE Creator_ID = ?',
    [userId] // ✅ 傳入參數
  );
  return rows;
};


export const getQB = async (id: number) => {
  const [rows]: any = await pool.query('SELECT * FROM QUESTION_BOOK WHERE QuestionBook_ID = ?', [id]);
  return rows[0];
};

export const updateQB = async (
  id: number,
  data: Record<string, any>,
  owner: number,
): Promise<boolean> => {
  // 1. 先確認擁有者
  const [[row]] = await pool.execute<RowDataPacket[]>(
    'SELECT Creator_ID FROM QUESTION_BOOK WHERE QuestionBook_ID = ?',
    [id],
  );
  if (!row || row.Creator_ID !== owner) return false;

  // 2. 過濾不能改的欄位 (Creator_ID / QuestionBook_ID)
  const keys = Object.keys(data).filter(k => !['Creator_ID', 'QuestionBook_ID'].includes(k));
  if (!keys.length) return true;       // 沒東西要改，算成功

  // 3. 動態組 SET
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const params = keys.map(k => data[k]);
  params.push(id);                     // WHERE ... = ?

  await pool.execute(
    `UPDATE QUESTION_BOOK SET ${setClause} WHERE QuestionBook_ID = ?`,
    params,
  );
  return true;
};

export const deleteQB = async (id: number, owner: number) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ 找出此題本的所有題目 ID
    const [questions]: any = await conn.query(
      `SELECT Question_ID FROM QUESTION_COLLECTION
       WHERE QuestionBook_ID = ? AND User_ID = ?`,
      [id, owner]
    );
    const qIds = questions.map(q => q.Question_ID);

    // 2️⃣ 刪掉關聯表
    await conn.query(
      `DELETE FROM QUESTION_COLLECTION
       WHERE QuestionBook_ID = ? AND User_ID = ?`,
      [id, owner]
    );

    // 3️⃣ 刪掉所有這本書的題目（你要確保是複製出來的、只屬於這本書）
    if (qIds.length > 0) {
      await conn.query(
        `DELETE FROM QUESTION
         WHERE Question_ID IN (${qIds.map(() => '?').join(',')}) AND Creator_id = ?`,
        [...qIds, owner]
      );
    }

    // 4️⃣ 刪掉題本
    const [r]: any = await conn.execute(
      `DELETE FROM QUESTION_BOOK
       WHERE QuestionBook_ID = ? AND Creator_ID = ?`,
      [id, owner]
    );

    await conn.commit();
    return r.affectedRows === 1;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const copyQB = async (id: number, owner: number) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣  取原始題本
    const [rows]: any = await conn.query(
      'SELECT BName, Icon FROM QUESTION_BOOK WHERE QuestionBook_ID = ? AND Creator_ID = ?',
      [id, owner],
    );
    if (!rows.length) { await conn.rollback(); return null; }

    // 2️⃣  插入新題本
    const [r] = await conn.execute<ResultSetHeader>(
      `INSERT INTO QUESTION_BOOK (BName, Icon, Creator_ID)
       VALUES (?, ?, ?)`,
      [`${rows[0].BName} 複製`, rows[0].Icon, owner],
    );
    const newId = (r as ResultSetHeader).insertId;

    // 3️⃣  複製原本的題目資料
    const [originalQuestions]: any = await conn.query(
      `SELECT * FROM QUESTION
       WHERE Question_ID IN (
         SELECT Question_ID FROM QUESTION_COLLECTION
         WHERE QuestionBook_ID = ? AND User_ID = ?
       )`,
      [id, owner]
    );

    const idMap = new Map<number, number>();
    for (const q of originalQuestions) {
      const [insertResult] = await conn.query(
        `INSERT INTO QUESTION (QType, Content, Content_pic, Answer, Answer_pic, DetailAns, DetailAns_pic, Subject, Level, Creator_id, isStar, practiceCount, errCount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.QType, q.Content, q.Content_pic, q.Answer, q.Answer_pic,
          q.DetailAns, q.DetailAns_pic, q.Subject, q.Level,
          owner, q.isStar, q.practiceCount, q.errCount
        ]
      );
      const newQId = (insertResult as ResultSetHeader).insertId;
      idMap.set(q.Question_ID, newQId);
    }

    // 4️⃣  建立新的關聯
    const [originalLinks]: any = await conn.query(
      `SELECT Question_ID, Error_Count
       FROM QUESTION_COLLECTION
       WHERE QuestionBook_ID = ? AND User_ID = ?`,
      [id, owner]
    );

    for (const link of originalLinks) {
      const newQId = idMap.get(link.Question_ID);
      if (!newQId) continue;

      await conn.query(
        `INSERT INTO QUESTION_COLLECTION
         (QuestionBook_ID, Question_ID, User_ID, Error_Count)
         VALUES (?, ?, ?, ?, ?)`,
        [newId, newQId, owner, link.Error_Count]
      );
    }

    // 5️⃣  更新題本的題數
    await conn.execute(
      `UPDATE QUESTION_BOOK
         SET Question_Count = ?
       WHERE QuestionBook_ID = ?`,
      [idMap.size, newId],
    );

    await conn.commit();
    return newId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

