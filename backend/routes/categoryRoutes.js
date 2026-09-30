import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();
router.get('/', listCategories);
router.post('/', protect, allowRoles('restaurant', 'admin'), createCategory);
router.put('/:id', protect, allowRoles('restaurant', 'admin'), updateCategory);
router.delete('/:id', protect, allowRoles('restaurant', 'admin'), deleteCategory);
export default router;
