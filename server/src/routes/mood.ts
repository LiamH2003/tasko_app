import { Router } from 'express';
import { logMood, getMoodHistory } from '../controllers/moodController';
import { authenticate } from '../middleware/auth';

export const moodRouter = Router();

moodRouter.use(authenticate);
moodRouter.post('/:childId', logMood);
moodRouter.get('/:childId', getMoodHistory);
