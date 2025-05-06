import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthReq extends Request {
  user?: { id: number };
}

export const auth = (req: AuthReq, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { id: number };
    req.user = { id: payload.id };
    next();             // ← 正常通過
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
