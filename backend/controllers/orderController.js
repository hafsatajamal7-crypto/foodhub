import Food from '../models/Food.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';

const roundMoney = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;
const statuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

export async function createOrder(req, res) {
  const { items, deliveryAddress, phone, paymentMethod = 'Cash on Delivery' } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Your cart is empty.' });
  if (!deliveryAddress?.trim() || !phone?.trim()) return res.status(400).json({ message: 'Delivery address and phone are required.' });
  if (paymentMethod !== 'Cash on Delivery') return res.status(400).json({ message: 'Only Cash on Delivery is available right now.' });
  const quantities = new Map();
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.food || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) return res.status(400).json({ message: 'Each cart quantity must be between 1 and 50.' });
    quantities.set(String(item.food), (quantities.get(String(item.food)) || 0) + quantity);
  }
  const foods = await Food.find({ _id: { $in: [...quantities.keys()] }, isAvailable: true });
  if (foods.length !== quantities.size) return res.status(400).json({ message: 'One or more items are no longer available.' });
  const restaurantIds = new Set(foods.map((food) => String(food.restaurant)));
  if (restaurantIds.size !== 1) return res.status(400).json({ message: 'Please place a separate order for each restaurant.' });
  const restaurant = await Restaurant.findOne({ _id: foods[0].restaurant, status: 'Approved' });
  if (!restaurant) return res.status(400).json({ message: 'This restaurant is not accepting orders.' });
  const orderItems = foods.map((food) => ({ food: food._id, name: food.name, quantity: quantities.get(String(food._id)), unitPrice: food.price }));
  const subtotal = roundMoney(orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const deliveryFee = roundMoney(restaurant.deliveryFee);
  const tax = roundMoney(subtotal * 0.08);
  const discount = 0;
  const total = roundMoney(subtotal + deliveryFee + tax - discount);
  const order = await Order.create({ customer: req.user._id, restaurant: restaurant._id, items: orderItems, subtotal, deliveryFee, tax, discount, total, deliveryAddress: deliveryAddress.trim(), phone: phone.trim(), paymentMethod });
  res.status(201).json({ order });
}

export async function myOrders(req, res) {
  const orders = await Order.find({ customer: req.user._id }).populate('restaurant', 'name logo').sort({ createdAt: -1 });
  res.json({ orders });
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id).populate('restaurant', 'name owner logo').populate('customer', 'name email phone');
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  const isCustomer = order.customer._id.equals(req.user._id);
  const isOwner = order.restaurant.owner.equals(req.user._id);
  if (!isCustomer && !isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only view your own orders.' });
  res.json({ order });
}

export async function restaurantOrders(req, res) {
  const restaurants = await Restaurant.find({ owner: req.user._id }).select('_id');
  const orders = await Order.find({ restaurant: { $in: restaurants.map((item) => item._id) } }).populate('customer', 'name phone').populate('restaurant', 'name').sort({ createdAt: -1 });
  res.json({ orders });
}

export async function adminOrders(req, res) {
  const filter = {};
  if (req.query.status && statuses.includes(req.query.status)) filter.orderStatus = req.query.status;
  if (req.query.restaurant) filter.restaurant = req.query.restaurant;
  const orders = await Order.find(filter).populate('customer', 'name email').populate('restaurant', 'name').sort({ createdAt: -1 }).limit(200);
  res.json({ orders });
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  if (!statuses.includes(status)) return res.status(400).json({ message: 'Invalid order status.' });
  const order = await Order.findById(req.params.id).populate('restaurant', 'owner');
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (req.user.role === 'customer') {
    if (!order.customer.equals(req.user._id) || status !== 'Cancelled' || order.orderStatus !== 'Pending') return res.status(403).json({ message: 'This order can no longer be cancelled.' });
  } else if (req.user.role === 'restaurant') {
    if (!order.restaurant.owner.equals(req.user._id)) return res.status(403).json({ message: 'You can only update orders for your restaurant.' });
    const transitions = { Pending: ['Confirmed', 'Cancelled'], Confirmed: ['Preparing', 'Cancelled'], Preparing: ['Ready'], Ready: ['Out for Delivery'], 'Out for Delivery': ['Delivered'] };
    if (!transitions[order.orderStatus]?.includes(status)) return res.status(400).json({ message: 'That status change is not allowed.' });
  }
  order.orderStatus = status;
  await order.save();
  res.json({ order });
}
