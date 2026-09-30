import Review from '../models/Review.js';
import Order from '../models/Order.js';

export async function createReview(req, res) {
  const { restaurant, food, rating, comment } = req.body;
  const delivered = await Order.exists({ customer: req.user._id, restaurant, orderStatus: 'Delivered', ...(food ? { 'items.food': food } : {}) });
  if (!delivered) return res.status(403).json({ message: 'You can review after a completed order.' });
  const review = await Review.create({ customer: req.user._id, restaurant, food, rating, comment });
  res.status(201).json({ review });
}

export async function foodReviews(req, res) {
  const reviews = await Review.find({ food: req.params.foodId }).populate('customer', 'name avatar').sort({ createdAt: -1 });
  res.json({ reviews });
}

export async function restaurantReviews(req, res) {
  const reviews = await Review.find({ restaurant: req.params.restaurantId }).populate('customer', 'name avatar').sort({ createdAt: -1 });
  res.json({ reviews });
}
