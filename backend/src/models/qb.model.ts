import { pool } from '../config/database';

interface QBInput {
  bname: string;
  question_count?: number;
  icon?: string;
  creator_id: number;
}

export const createQB = async (qb: QBInput) => {
  const [r]: any = await pool.execute(
    'INSERT INTO question_book (bname, question_count, icon, creator_id) VALUES (?,?,?,?)',
    [qb.bname, qb.question_count || 0, qb.icon, qb.creator_id],
  );
  return r.insertId as number;
};

export const listQB = async () => {
  const [rows] = await pool.query('SELECT * FROM question_book');
  return rows;
};

export const getQB = async (id: number) => {
  const [rows]: any = await pool.query('SELECT * FROM question_book WHERE questionbook_id = ?', [id]);
  return rows[0];
};

export const updateQB = async (id: number, data: any, owner: number) => {
  const [rows]: any = await pool.query(
    'SELECT creator_id FROM question_book WHERE questionbook_id = ?',
    [id],
  );
  if (!rows[0] || rows[0].creator_id !== owner) return false;

  const fields = Object.keys(data).filter(k => k !== 'creator_id').map(k => `${k} = ?`).join(', ');
  const params = [...Object.values(data), id];
  await pool.execute(`UPDATE question_book SET ${fields} WHERE questionbook_id = ?`, params);
  return true;
};

export const deleteQB = async (id: number, owner: number) => {
  const [r]: any = await pool.execute(
    'DELETE FROM question_book WHERE questionbook_id = ? AND creator_id = ?',
    [id, owner],
  );
  return r.affectedRows === 1;
};
