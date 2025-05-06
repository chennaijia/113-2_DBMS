import { Router } from 'express';
import {
  createQuestion,
  listQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question.controller';
import { auth } from '../middleware/auth';

export const questionRouter = Router();

// 需要登入的路由加 auth middleware
questionRouter.post('/',        auth, createQuestion);
questionRouter.get('/',                listQuestions);        // 公開列出
questionRouter.get('/:id',             getQuestion);
questionRouter.put('/:id',      auth, updateQuestion);
questionRouter.delete('/:id',   auth, deleteQuestion);

