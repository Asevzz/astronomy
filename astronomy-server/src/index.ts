import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import newsRoutes from './routes/materials.routes.js';
import testsRoutes from './routes/tests.routes.js';
import lobbyRoutes from './routes/lobby.routes.js';
import textbookRoutes from './routes/textbook.routes.js';
import wheelRoutes from './routes/wheel.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

// ВРЕМЕННО: лог всех запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/lobby', lobbyRoutes);
app.use('/api/textbook', textbookRoutes);
app.use('/api/wheel', wheelRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/textbook', textbookRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});