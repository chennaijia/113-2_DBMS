import { Router } from 'express';
import {
  listQuestions,
} from '../controllers/question.controller';
import { auth } from '../middleware/auth';
import { listQuestionsByBook } from '../controllers/question.controller'
import { Request, Response, NextFunction } from 'express';
import { uploadQuestion } from '../controllers/question.controller';
import { upload } from '../middleware/upload';

export const questionRouter = Router();

questionRouter.post('/upload', auth, upload, uploadQuestion);
questionRouter.get(
  '/by-book/:bookId',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookId = Number(req.params.bookId);
      // @ts-ignore
      const userId = req.user?.id;
      const result = await listQuestionsByBook(bookId, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
)


