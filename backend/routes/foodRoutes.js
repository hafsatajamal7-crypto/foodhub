import { Router } from 'express';
import { createFood, deleteFood, getFood, listFoods, updateFood } from '../controllers/foodController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.get('/', listFoods);
router.get('/:id', getFood);
router.post('/', protect, allowRoles('restaurant', 'admin'), createFood);
router.put('/:id', protect, allowRoles('restaurant', 'admin'), updateFood);
router.delete('/:id', protect, allowRoles('restaurant', 'admin'), deleteFood);
export default router;
