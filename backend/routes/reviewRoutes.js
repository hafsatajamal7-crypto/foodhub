import { Router } from 'express';
import { createReview, foodReviews, restaurantReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/', protect, createReview);
router.get('/food/:foodId', foodReviews);
router.get('/restaurant/:restaurantId', restaurantReviews);
export default router;
