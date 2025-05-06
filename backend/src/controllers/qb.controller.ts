import { Request, Response } from 'express';
import * as QB from '../models/qb.model';
import { AuthReq } from '../middleware/auth';

/* ========== CRUD ========== */

/** POST /api/books */
export const createQB = async (req: AuthReq, res: Response): Promise<void> => {
  const id = await QB.createQB({ ...req.body, creator_id: req.user!.id });
  res.status(201).json({ id });
};

/** GET /api/books */
export const listQB = async (_req: Request, res: Response): Promise<void> => {
  res.json(await QB.listQB());
};

/** GET /api/books/:id */
export const getQB = async (req: Request, res: Response): Promise<void> => {
  const row = await QB.getQB(+req.params.id);
  if (!row) { res.sendStatus(404); return; }
  res.json(row);
};

/** PUT /api/books/:id */
export const updateQB = async (req: AuthReq, res: Response): Promise<void> => {
  const ok = await QB.updateQB(+req.params.id, req.body, req.user!.id);
  if (!ok) { res.sendStatus(403); return; }
  res.sendStatus(204);
};

/** DELETE /api/books/:id */
export const deleteQB = async (req: AuthReq, res: Response): Promise<void> => {
  const ok = await QB.deleteQB(+req.params.id, req.user!.id);
  if (!ok) { res.sendStatus(403); return; }
  res.sendStatus(204);
};
