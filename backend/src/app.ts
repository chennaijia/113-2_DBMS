import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { questionRouter } from './routes/question.routes';
import { qbRouter } from './routes/qb.routes';


const app = express();

// 測試首頁
app.get('/', (req, res) => {
  res.send('Hello from Express! 👋');

});

app.get('/ping', (req, res) => {
  res.send('pong!');
});


export { app };


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/books', qbRouter);
