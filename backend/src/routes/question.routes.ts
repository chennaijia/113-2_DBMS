import { Router } from 'express';
import {
  listQuestions,
} from '../controllers/question.controller';
import { auth } from '../middleware/auth';
import { listQuestionsByBook } from '../controllers/question.controller'
import { Request, Response, NextFunction } from 'express';
import { uploadQuestion, toggleStar ,updateNote ,getRandomQuestion, getRandomWrongQuestions, getMostWrongQuestions} from '../controllers/question.controller';
import { upload } from '../middleware/upload';
import { deleteQuestion } from '../controllers/question.controller';
export const questionRouter = Router();

questionRouter.post('/upload', auth, upload, uploadQuestion);
questionRouter.get('/by-book/:bookId', auth, listQuestionsByBook)
questionRouter.delete('/:id', auth, deleteQuestion)
questionRouter.patch('/:id/star', auth, toggleStar)
questionRouter.patch('/:id/note', auth, updateNote)
questionRouter.get('/random', auth, getRandomQuestion)
questionRouter.get('/random-practice', auth, getRandomWrongQuestions)
questionRouter.get('/most-wrong', auth, getMostWrongQuestions)








