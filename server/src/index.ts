import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth';
import { childrenRouter } from './routes/children';
import { routinesRouter } from './routes/routines';
import { moodRouter } from './routes/mood';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/mood', moodRouter);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/tasko')
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
