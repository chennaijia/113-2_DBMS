import { Request, Response } from 'express';
import * as Question from '../models/question.model';
import { AuthReq } from '../middleware/auth';

/** POST /api/questions */
export const createQuestion = async (req: AuthReq, res: Response): Promise<void> => {
  const id = await Question.createQuestion({ ...req.body, creator_id: req.user!.id });
  res.status(201).json({ id });
};

/** GET /api/questions */
export const listQuestions = async (req: Request, res: Response): Promise<void> => {
  const rows = await Question.listQuestions(req.query);
  res.json(rows);
};

/** GET /api/questions/:id */
export const getQuestion = async (req: Request, res: Response): Promise<void> => {
  const row = await Question.getQuestion(+req.params.id);
  if (!row) { res.sendStatus(404); return; }
  res.json(row);
};

/** PUT /api/questions/:id */
export const updateQuestion = async (req: AuthReq, res: Response): Promise<void> => {
  const ok = await Question.updateQuestion(+req.params.id, req.body, req.user!.id);
  if (!ok) { res.sendStatus(403); return; }
  res.sendStatus(204);
};

/** DELETE /api/questions/:id */
export const deleteQuestion = async (req: AuthReq, res: Response): Promise<void> => {
  const ok = await Question.deleteQuestion(+req.params.id, req.user!.id);
  if (!ok) { res.sendStatus(403); return; }
  res.sendStatus(204);
};
