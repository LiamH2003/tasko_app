import { Request, Response, NextFunction } from 'express';
import { Routine } from '../models/Routine';
import { Child } from '../models/Child';

const XP_TASK = 10;
const XP_ROUTINE_BONUS = 25;

export async function getRoutines(req: Request, res: Response, next: NextFunction) {
  try {
    const routines = await Routine.find({ childId: req.params.childId });
    res.json(routines);
  } catch (err) {
    next(err);
  }
}

export async function createRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const routine = await Routine.create({ ...req.body, childId: req.params.childId });
    res.status(201).json(routine);
  } catch (err) {
    next(err);
  }
}

export async function updateRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const routine = await Routine.findByIdAndUpdate(req.params.routineId, req.body, { new: true });
    if (!routine) return res.status(404).json({ message: 'Not found' });
    res.json(routine);
  } catch (err) {
    next(err);
  }
}

export async function deleteRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    await Routine.findByIdAndDelete(req.params.routineId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function completeTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { childId, routineId, taskId } = req.params;
    const routine = await Routine.findById(routineId);
    if (!routine) return res.status(404).json({ message: 'Not found' });

    const task = routine.tasks.find((t: any) => String(t._id) === taskId);
    if (!task || task.completed) {
      return res.status(400).json({ message: 'Task already completed or not found' });
    }

    task.completed = true;
    await routine.save();

    const allDone = routine.tasks.every((t: any) => t.completed);
    const xpGain = XP_TASK + (allDone ? XP_ROUTINE_BONUS : 0);

    await Child.findByIdAndUpdate(childId, { $inc: { 'monster.xp': xpGain } });
    res.json({ xpGained: xpGain, routineComplete: allDone });
  } catch (err) {
    next(err);
  }
}
