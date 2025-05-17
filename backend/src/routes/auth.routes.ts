import { Router } from 'express';
import { register, login, getMe, logVerify} from '../controllers/auth.controller';

export const authRouter = Router();


authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verify', logVerify);
authRouter.get('/auth/me', getMe);



