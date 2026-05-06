import { Router } from 'express';
import { getChildren, getChild, updateChild } from '../controllers/childController';
import { authenticate } from '../middleware/auth';

export const childrenRouter = Router();

childrenRouter.use(authenticate);
childrenRouter.get('/', getChildren);
childrenRouter.get('/:id', getChild);
childrenRouter.patch('/:id', updateChild);
