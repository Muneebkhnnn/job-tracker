import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;
if (!MONGO_URI || !JWT_SECRET) {
  console.error('Set MONGO_URI and JWT_SECRET in server/.env (see .env.example)');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API listening on port ${PORT}`)))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
