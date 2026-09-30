import Restaurant from '../models/Restaurant.js';

export async function listRestaurants(req, res) {
  const { search = '', cuisine, rating, sort = 'rating', page = 1, limit = 12 } = req.query;
  const filter = { status: 'Approved' };
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { cuisine: { $regex: search, $options: 'i' } }];
  if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' };
  if (rating) filter.rating = { $gte: Number(rating) };
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));
  const sortBy = sort === 'deliveryFee' ? { deliveryFee: 1 } : sort === 'name' ? { name: 1 } : { rating: -1 };
  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).sort(sortBy).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Restaurant.countDocuments(filter),
  ]);
  res.json({ restaurants, page: pageNumber, pages: Math.ceil(total / pageSize), total });
}

export async function getRestaurant(req, res) {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, status: 'Approved' });
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
  res.json({ restaurant });
}

export async function createRestaurant(req, res) {
  const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id, status: 'Pending' });
  res.status(201).json({ restaurant, message: 'Restaurant submitted for admin approval.' });
}

export async function updateRestaurant(req, res) {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
  if (req.user.role !== 'admin' && !restaurant.owner.equals(req.user._id)) return res.status(403).json({ message: 'You can only update your own restaurant.' });
  const editable = ['name', 'description', 'logo', 'coverImage', 'cuisine', 'address', 'phone', 'deliveryTime', 'deliveryFee', 'openingHours'];
  for (const field of editable) if (req.body[field] !== undefined) restaurant[field] = req.body[field];
  if (req.user.role === 'admin' && ['Pending', 'Approved', 'Rejected', 'Blocked'].includes(req.body.status)) restaurant.status = req.body.status;
  await restaurant.save();
  res.json({ restaurant });
}

export async function deleteRestaurant(req, res) {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
  if (req.user.role !== 'admin' && !restaurant.owner.equals(req.user._id)) return res.status(403).json({ message: 'You can only delete your own restaurant.' });
  await restaurant.deleteOne();
  res.json({ message: 'Restaurant deleted.' });
}

export async function myRestaurants(req, res) {
  const restaurants = req.user.role === 'admin' ? await Restaurant.find().sort({ createdAt: -1 }) : await Restaurant.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ restaurants });
}
