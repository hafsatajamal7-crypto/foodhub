import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import Food from '../models/Food.js';

export async function listUsers(req, res) {
  const { search = '', role, page = 1 } = req.query;
  const filter = {};
  if (role && ['customer', 'restaurant', 'admin'].includes(role)) filter.role = role;
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const pageNumber = Math.max(1, Number(page) || 1);
  const [users, total] = await Promise.all([User.find(filter).select('-password').sort({ createdAt: -1 }).skip((pageNumber - 1) * 25).limit(25), User.countDocuments(filter)]);
  res.json({ users, total, page: pageNumber, pages: Math.ceil(total / 25) });
}

export async function updateUserBlock(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Admin accounts cannot be blocked here.' });
  user.isBlocked = Boolean(req.body.isBlocked);
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked } });
}

export async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Admin accounts cannot be deleted here.' });
  await user.deleteOne();
  res.json({ message: 'User deleted.' });
}

export async function dashboardSummary(req, res) {
  const [users, restaurants, orders, revenue, pendingRestaurants, pendingOrders, foodCount] = await Promise.all([
    User.countDocuments(), Restaurant.countDocuments(), Order.countDocuments(),
    Order.aggregate([{ $match: { orderStatus: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Restaurant.countDocuments({ status: 'Pending' }), Order.countDocuments({ orderStatus: 'Pending' }), Food.countDocuments(),
  ]);
  res.json({ users, restaurants, orders, revenue: revenue[0]?.total || 0, pendingRestaurants, pendingOrders, foods: foodCount });
}
