// backend/src/controllers/qb.controller.ts
import { Request, Response } from 'express';
import * as QB from '../models/qb.model';   // 確保 model 裡用的是 QUESTION_BOOK
import { AuthReq } from '../middleware/auth';

/** POST /api/qb － 建立題本 */
export const createQB = async (req: AuthReq, res: Response) => {
  const { BName, Icon } = req.body;
  if (!BName) return res.status(400).json({ message: 'BName 必填' });

  const id = await QB.createQB({ BName, Icon, Creator_ID: req.user!.id });
  res.status(201).json({ QuestionBook_ID: id });
};


/** GET /api/qb － 顯示所有題本 */
export const listQB = async (_req: Request, res: Response) => {
  const rows = await QB.listQB();
  res.json(rows);
};

/** GET /api/qb/:id － 取得單一題本 */
export const getQB = async (req, res) =>  {
  const row = await QB.getQB(+req.params.id);
  if (!row) return res.sendStatus(404);
  res.json(row);
};

/** PUT /api/qb/:id － 更新（僅限擁有者） */
export const updateQB =  async (req, res)  => {
  const ok = await QB.updateQB(+req.params.id, req.body, req.user!.id);
  return ok ? res.sendStatus(204) : res.sendStatus(403);
};

/** DELETE /api/qb/:id － 刪除（僅限擁有者） */
export const deleteQB = async (req, res) =>  {
  const ok = await QB.deleteQB(+req.params.id, req.user!.id);
  return ok ? res.sendStatus(204) : res.sendStatus(403);
};

export const copyQB = async (req: AuthReq, res: Response) => {
  const newId = await QB.copyQB(+req.params.id, req.user!.id);
  if (!newId) return res.sendStatus(404);           // 找不到或沒權限
  res.status(201).json({ QuestionBook_ID: newId }); // 201 Created
};
