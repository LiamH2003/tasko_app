import { Request, Response, NextFunction } from 'express';
import { Child } from '../models/Child';

export async function getChildren(req: Request, res: Response, next: NextFunction) {
  try {
    const children = await Child.find({ parentId: req.userId });
    res.json(children);
  } catch (err) {
    next(err);
  }
}

export async function getChild(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOne({ _id: req.params.id, parentId: req.userId });
    if (!child) return res.status(404).json({ message: 'Not found' });
    res.json(child);
  } catch (err) {
    next(err);
  }
}

export async function updateChild(req: Request, res: Response, next: NextFunction) {
  try {
    const child = await Child.findOneAndUpdate(
      { _id: req.params.id, parentId: req.userId },
      req.body,
      { new: true }
    );
    if (!child) return res.status(404).json({ message: 'Not found' });
    res.json(child);
  } catch (err) {
    next(err);
  }
}
