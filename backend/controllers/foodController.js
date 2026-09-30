import Food from '../models/Food.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';

async function canManage(req, restaurantId) {
  const restaurant = await Restaurant.findById(restaurantId);
  return restaurant && (req.user.role === 'admin' || restaurant.owner.equals(req.user._id)) ? restaurant : null;
}

export async function listFoods(req, res) {
  const { search = '', category, restaurant, page = 1, limit = 24, maxPrice } = req.query;
  const filter = { isAvailable: true };
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
  if (category) filter.category = category;
  if (restaurant) filter.restaurant = restaurant;
  if (maxPrice && Number.isFinite(Number(maxPrice))) filter.price = { $lte: Number(maxPrice) };
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 24));
  const restaurantIds = await Restaurant.find({ status: 'Approved' }).distinct('_id');
  filter.restaurant = filter.restaurant ? { $in: restaurantIds, $eq: filter.restaurant } : { $in: restaurantIds };
  const [foods, total] = await Promise.all([
    Food.find(filter).populate('restaurant', 'name cuisine deliveryTime deliveryFee').populate('category', 'name').sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Food.countDocuments(filter),
  ]);
  res.json({ foods, page: pageNumber, pages: Math.ceil(total / pageSize), total });
}

export async function getFood(req, res) {
  const food = await Food.findById(req.params.id).populate('restaurant', 'name cuisine status').populate('category', 'name');
  if (!food || !food.isAvailable || food.restaurant.status !== 'Approved') return res.status(404).json({ message: 'Food item not found.' });
  res.json({ food });
}

export async function createFood(req, res) {
  const { restaurant: restaurantId, category: categoryId } = req.body;
  const restaurant = await canManage(req, restaurantId);
  if (!restaurant) return res.status(403).json({ message: 'You can only manage food for your own restaurant.' });
  const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
  if (!category) return res.status(400).json({ message: 'Choose a category from this restaurant.' });
  const food = await Food.create({ ...req.body, restaurant: restaurantId, category: categoryId });
  res.status(201).json({ food });
}

export async function updateFood(req, res) {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ message: 'Food item not found.' });
  if (!(await canManage(req, food.restaurant))) return res.status(403).json({ message: 'You can only update your own restaurant food.' });
  const fields = ['category', 'name', 'description', 'price', 'image', 'ingredients', 'isAvailable'];
  for (const field of fields) if (req.body[field] !== undefined) food[field] = req.body[field];
  if (req.body.category) {
    const category = await Category.findOne({ _id: req.body.category, restaurant: food.restaurant });
    if (!category) return res.status(400).json({ message: 'Choose a category from this restaurant.' });
  }
  await food.save();
  res.json({ food });
}

export async function deleteFood(req, res) {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).json({ message: 'Food item not found.' });
  if (!(await canManage(req, food.restaurant))) return res.status(403).json({ message: 'You can only delete your own restaurant food.' });
  await food.deleteOne();
  res.json({ message: 'Food item deleted.' });
}
