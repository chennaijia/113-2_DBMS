import { Router } from 'express'
import { auth } from '../middleware/auth'
import { postCheckIn, getMonthlyCheckIns } from '../controllers/checking.controller'


const router = Router();

router.post('/', auth, postCheckIn);
router.get('/', auth, getMonthlyCheckIns);

export default router;




