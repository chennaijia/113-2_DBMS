import { Router } from 'express';
import { register, login, getMe} from '../controllers/auth.controller';

export const authRouter = Router();


authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/auth/me', getMe);



