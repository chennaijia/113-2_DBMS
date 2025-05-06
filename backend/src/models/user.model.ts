import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

export const createUser = async (name: string, email: string, pwd: string) => {
  const hash = await bcrypt.hash(pwd, 10);
  const [r]: any = await pool.execute(
    'INSERT INTO user (user_name, user_email, password) VALUES (?,?,?)',
    [name, email, hash],
  );
  return r.insertId as number;
};

export const getUserByEmail = async (email: string) => {
  const [rows]: any = await pool.execute(
    'SELECT * FROM user WHERE user_email = ? LIMIT 1',
    [email],
  );
  return rows[0];
};
