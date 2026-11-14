import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
