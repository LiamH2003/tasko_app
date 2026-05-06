import { Router } from 'express';
import { getRoutines, createRoutine, updateRoutine, deleteRoutine, completeTask } from '../controllers/routineController';
import { authenticate } from '../middleware/auth';

export const routinesRouter = Router();

routinesRouter.use(authenticate);
routinesRouter.get('/:childId', getRoutines);
routinesRouter.post('/:childId', createRoutine);
routinesRouter.patch('/:childId/:routineId', updateRoutine);
routinesRouter.delete('/:childId/:routineId', deleteRoutine);
routinesRouter.post('/:childId/:routineId/tasks/:taskId/complete', completeTask);
