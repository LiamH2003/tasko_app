import { Request, Response, NextFunction } from 'express';
import { MoodEntry } from '../models/MoodEntry';

export async function logMood(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await MoodEntry.create({ ...req.body, childId: req.params.childId });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getMoodHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const entries = await MoodEntry.find({ childId: req.params.childId }).sort({ timestamp: -1 }).limit(30);
    res.json(entries);
  } catch (err) {
    next(err);
  }
}
