// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { createUser, getUserByEmail } from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/** POST /api/auth/register */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }

  if (await getUserByEmail(email)) {
    res.status(409).json({ message: 'Email exists' });
    return;
  }

  const id = await createUser(name, email, password);
  res.status(201).json({ id });   // ← 不要 return
};

/** POST /api/auth/login */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // ✅ 檢查欄位是否空值
    if (!email || !password) {
      res.status(400).json({ message: '請輸入 Email 和密碼！📝' });
      return;
    }

    // 🔍 嘗試取得使用者資料
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: '找不到這個 Email，請確認是否註冊過 🧐' });
      return;
    }

    // 🔐 驗證密碼（確保資料庫有正確存 User_Password）
    const passwordMatch = await bcrypt.compare(password, user.User_Password);
    if (!passwordMatch) {
      res.status(401).json({ message: '密碼錯誤，請再試一次 🙁' });
      return;
    }

    // 🪄 成功登入，產生 JWT token
    const token = jwt.sign({ id: user.User_ID }, env.JWT_SECRET, { expiresIn: '7d' });

    // ✅ 回傳成功訊息與 token
    res.json({
      message: '登入成功！🎉 歡迎回來～',
      token
    });

  } catch (err) {
    console.error('登入錯誤❗️:', err);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試 😢' });
  }
};

/** GET /api/auth/me */
export const getMe = (req: Request, res: Response): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: '請附上授權 token 🙅‍♀️' });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    const decoded = jwt.verify(token, env.JWT_SECRET);

    res.json({
      message: 'Token 驗證成功 🎉',
      user: decoded // decoded 會長這樣 { id: 1, iat: ..., exp: ... }
    });

  } catch (err) {
    res.status(401).json({ message: '無效的 token 🛑' });
  }
};

