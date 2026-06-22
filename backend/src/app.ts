import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
// 👉 Ajoute ici tes futures routes : app.use('/api/xxx', xxxRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
