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

export const listQB = async () => {
  const [rows] = await pool.query('SELECT * FROM Question_Book');
  return rows;
};

export const getQB = async (id: number) => {
  const [rows]: any = await pool.query('SELECT * FROM Question_Book WHERE Questionbook_ID = ?', [id]);
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
  const params    = keys.map(k => data[k]);
  params.push(id);                     // WHERE ... = ?

  await pool.execute(
    `UPDATE QUESTION_BOOK SET ${setClause} WHERE QuestionBook_ID = ?`,
    params,
  );
  return true;
};

export const deleteQB = async (id: number, owner: number) => {
  const [r]: any = await pool.execute(
    'DELETE FROM Question_Book WHERE Questionbook_ID = ? AND Creator_ID = ?',
    [id, owner],
  );
  return r.affectedRows === 1;
};

export const copyQB = async (id: number, owner: number) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣  取原始資料（只能複製自己的）
    const [rows]: any = await conn.query(
      'SELECT BName, Icon FROM QUESTION_BOOK WHERE QuestionBook_ID = ? AND Creator_ID = ?',
      [id, owner],
    );
    if (!rows.length) { await conn.rollback(); return null; }

    // 2️⃣  插入新紀錄（名稱自動加「複製」）
    const [r] = await conn.execute<ResultSetHeader>(
      `INSERT INTO QUESTION_BOOK (BName, Icon, Creator_ID)
       VALUES (?, ?, ?)`,
      [`${rows[0].BName} 複製`, rows[0].Icon, owner],
    );
    const newId = (r as ResultSetHeader).insertId;

    // 3️⃣  若之後要連同題目一起複製，可在這裡再 INSERT … SELECT
    await conn.commit();
    return newId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
