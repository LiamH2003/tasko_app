import { Router } from 'express';
import { register, login, refreshToken } from '../controllers/authController';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);
