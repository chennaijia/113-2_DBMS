import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors()); // 讓前端可以連線
app.use(express.json()); // 讓後端可以讀 JSON

// 測試用 API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
