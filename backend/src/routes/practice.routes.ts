import express from 'express';
import { createReviewTest } from '../controllers/practice.controller'

const PracteRouter = express.Router();

// POST /api/review-test
PracteRouter.post('/', createReviewTest);

export default PracteRouter;
