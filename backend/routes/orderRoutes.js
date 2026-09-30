import { Router } from 'express';
import { adminOrders, createOrder, getOrder, myOrders, restaurantOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(protect);
router.post('/', allowRoles('customer'), createOrder);
router.get('/my-orders', allowRoles('customer'), myOrders);
router.get('/restaurant', allowRoles('restaurant'), restaurantOrders);
router.get('/admin', allowRoles('admin'), adminOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
export default router;
