import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { questionRouter } from './routes/question.routes';
import { qbRouter } from './routes/qb.routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/books', qbRouter);
