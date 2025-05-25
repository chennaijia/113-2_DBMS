import express from 'express';
import cors from 'cors';
import { auth } from './middleware/auth';
import { authRouter } from './routes/auth.routes';
import { questionRouter } from './routes/question.routes';
import { qbRouter } from './routes/qb.routes';
import PracticeRouter from './routes/practice.routes';
import checkinRoutes from './routes/checking.route';
import { pool } from './config/database';


import * as dotenv from 'dotenv';
dotenv.config();

const app = express();


// 測試首頁
app.get('/', (req, res) => {
  res.send('Hello from Express! 👋');


});
app.get('/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM TAG');
    res.send(rows);
  } catch (err) {
    console.error('❌ 查詢失敗：', err);
    res.status(500).send('資料查詢失敗');
  }
});
app.get('/ping', (req, res) => {
  res.send('pong!');
});
app.get('/api', (req, res) => {
  res.send('API is running!');
});

export { app };

app.use(cors());
app.use(express.json());


// 註冊 authRouter
app.use('/api/auth', authRouter);
app.use('/api/log', authRouter);
// 註冊其他路由
app.use('/api/question', questionRouter);
app.use('/api/books', qbRouter);
app.use('/api/questions', questionRouter)
app.use('/api/checking', checkinRoutes);
app.use('/api/review-test', PracticeRouter);

app.listen(3000, () => console.log('API on http://localhost:3000'));





