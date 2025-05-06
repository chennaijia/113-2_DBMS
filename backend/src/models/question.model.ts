import { pool } from '../config/database';

interface QuestionInput {
  qtype: string;
  content: string;
  content_pic?: string;
  answer?: string;
  answer_pic?: string;
  detail_ans?: string;
  detail_ans_pic?: string;
  qtype2?: string;
  subject?: string;
  level?: number;
  creator_id: number;
}

export const createQuestion = async (q: QuestionInput) => {
  const [r]: any = await pool.execute(
    `INSERT INTO question
     (qtype,content,content_pic,answer,answer_pic,detail_ans,detail_ans_pic,qtype2,subject,level,creator_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      q.qtype,
      q.content,
      q.content_pic,
      q.answer,
      q.answer_pic,
      q.detail_ans,
      q.detail_ans_pic,
      q.qtype2,
      q.subject,
      q.level || 1,
      q.creator_id,
    ],
  );
  return r.insertId as number;
};

export const listQuestions = async (query: any) => {
  const { subject, creator } = query;
  let sql = 'SELECT * FROM question';
  const conds: string[] = [];
  const params: any[] = [];

  if (subject) { conds.push('subject = ?'); params.push(subject); }
  if (creator) { conds.push('creator_id = ?'); params.push(+creator); }

  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const getQuestion = async (id: number) => {
  const [rows]: any = await pool.query('SELECT * FROM question WHERE question_id = ?', [id]);
  return rows[0];
};

export const updateQuestion = async (id: number, data: any, owner: number) => {
  // 確認擁有者
  const [rows]: any = await pool.query(
    'SELECT creator_id FROM question WHERE question_id = ?',
    [id],
  );
  if (!rows[0] || rows[0].creator_id !== owner) return false;

  const fields = Object.keys(data)
    .filter(k => k !== 'creator_id')
    .map(k => `${k} = ?`)
    .join(', ');
  const params = [...Object.values(data), id];

  await pool.execute(`UPDATE question SET ${fields} WHERE question_id = ?`, params);
  return true;
};

export const deleteQuestion = async (id: number, owner: number) => {
  const [r]: any = await pool.execute(
    'DELETE FROM question WHERE question_id = ? AND creator_id = ?',
    [id, owner],
  );
  return r.affectedRows === 1;
};
