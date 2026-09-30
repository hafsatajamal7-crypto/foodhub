import Category from '../models/Category.js';
import Restaurant from '../models/Restaurant.js';

async function canManage(req, restaurantId) {
  const restaurant = await Restaurant.findById(restaurantId);
  return restaurant && (req.user.role === 'admin' || restaurant.owner.equals(req.user._id)) ? restaurant : null;
}

export async function listCategories(req, res) {
  const filter = {};
  if (req.query.restaurant) filter.restaurant = req.query.restaurant;
  if (!req.user || req.user.role !== 'admin') {
    const approved = await Restaurant.find({ status: 'Approved' }).distinct('_id');
    filter.restaurant = filter.restaurant ? { $in: approved, $eq: filter.restaurant } : { $in: approved };
  }
  res.json({ categories: await Category.find(filter).sort({ name: 1 }) });
}

export async function createCategory(req, res) {
  if (!(await canManage(req, req.body.restaurant))) return res.status(403).json({ message: 'You can only manage categories for your own restaurant.' });
  const category = await Category.create({ name: req.body.name, image: req.body.image, restaurant: req.body.restaurant });
  res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found.' });
  if (!(await canManage(req, category.restaurant))) return res.status(403).json({ message: 'You can only update your own restaurant categories.' });
  if (req.body.name) category.name = req.body.name;
  if (req.body.image !== undefined) category.image = req.body.image;
  await category.save();
  res.json({ category });
}

export async function deleteCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found.' });
  if (!(await canManage(req, category.restaurant))) return res.status(403).json({ message: 'You can only delete your own restaurant categories.' });
  await category.deleteOne();
  res.json({ message: 'Category deleted.' });
}
