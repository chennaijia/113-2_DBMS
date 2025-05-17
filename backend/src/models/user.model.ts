import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

export const createUser = async (name: string, email: string, pwd: string) => {
  const hash = await bcrypt.hash(pwd, 10);
  const [r]: any = await pool.execute(
    'INSERT INTO USER (User_name, User_email, User_Password) VALUES (?,?,?)',
    [name, email, hash],
  );
  return r.insertId as number;
};

export const getUserByEmail = async (email: string) => {
  const [rows]: any = await pool.execute(
    'SELECT User_ID, User_name, User_email, User_Password, SignUpDate FROM USER WHERE User_email = ? LIMIT 1',
    [email],
  );
  return rows[0];
};
