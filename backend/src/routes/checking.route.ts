import express from 'express';
import { createCheckIn, getCheckInsByMonth } from '../controllers/checking.controller';
import { auth, AuthReq } from '../middleware/auth';

const Checkrouter = express.Router();

Checkrouter.post('/checking', auth, asyncHandler(createCheckIn));
Checkrouter.get('/getcheckings', auth, asyncHandler(getCheckInsByMonth));

export default Checkrouter;



function asyncHandler(
  fn: (req: AuthReq, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>
): express.RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as AuthReq, res)).catch(next);
  };
}

