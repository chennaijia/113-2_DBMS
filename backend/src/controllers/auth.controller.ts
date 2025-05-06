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
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) { res.status(401).json({ message: 'Invalid credentials' }); return; }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) { res.status(401).json({ message: 'Invalid credentials' }); return; }

  const token = jwt.sign({ id: user.user_id }, env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });            // ← 也不要 return
};
