import { Router } from 'express';
import { deleteUser, dashboardSummary, listUsers, updateUserBlock } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.use(protect, allowRoles('admin'));
router.get('/summary', dashboardSummary);
router.get('/users', listUsers);
router.put('/users/:id/block', updateUserBlock);
router.delete('/users/:id', deleteUser);
export default router;
