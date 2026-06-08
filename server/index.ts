import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import apiRouter from './routes/api';
import functionsRouter from './routes/functions';
import { pool } from './db';

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/functions/v1', functionsRouter);

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err: any) {
    res.status(503).json({ status: 'error', database: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`Database: ${process.env.PG_DATABASE || 'StockManagement'} @ ${process.env.PG_HOST || 'localhost'}:${process.env.PG_PORT || 5432}`);
});
