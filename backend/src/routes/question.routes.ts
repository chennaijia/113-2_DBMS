import { Router } from 'express';
import {
  uploadQuestion,
  listQuestions,
} from '../controllers/question.controller';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';

export const questionRouter = Router();

questionRouter.post('/upload', auth, upload, uploadQuestion);
questionRouter.get('/questions', auth, listQuestions); // ⬅️ 要有 auth 才能取得 user.id


