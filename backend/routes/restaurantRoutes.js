import { Router } from 'express';
import { createRestaurant, deleteRestaurant, getRestaurant, listRestaurants, myRestaurants, updateRestaurant } from '../controllers/restaurantController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.get('/', listRestaurants);
router.get('/mine', protect, allowRoles('restaurant', 'admin'), myRestaurants);
router.get('/:id', getRestaurant);
router.post('/', protect, allowRoles('restaurant', 'admin'), createRestaurant);
router.put('/:id', protect, allowRoles('restaurant', 'admin'), updateRestaurant);
router.delete('/:id', protect, allowRoles('restaurant', 'admin'), deleteRestaurant);
export default router;
