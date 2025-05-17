import { Router } from 'express';
import {
  uploadQuestion,
  listQuestions,
} from '../controllers/question.controller';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';

export const questionRouter = Router();

questionRouter.get('/', listQuestions);
questionRouter.post('/upload', auth, upload, uploadQuestion);


// 其他題目路由
//questionRouter.post('/', auth, createQuestion);
//questionRouter.get('/', listQuestions);
