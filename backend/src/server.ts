import { app } from './app';
import { env } from './config/env';
import { pool } from './config/database';
import http from 'http';

const server = http.createServer((request, response) => {
  response.end("Hello From NodeJS Server 2");
});

app.listen(env.PORT, () => {
  console.log(`🚀 API running on http://localhost:${env.PORT}`);
});

app.get('/', (req, res) => {
  res.send('Hello World 🌍');
});
