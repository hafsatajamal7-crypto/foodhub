import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  address: user.address,
});

export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  const user = await User.create({ name: name.trim(), email, password, phone, role: 'customer' });
  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (user.isBlocked) return res.status(403).json({ message: 'This account is currently blocked.' });
  res.json({ token: generateToken(user._id), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  const allowed = ['name', 'phone', 'address', 'avatar'];
  for (const field of allowed) {
    if (typeof req.body[field] === 'string') req.user[field] = req.body[field].trim();
  }
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword || ''))) return res.status(400).json({ message: 'Current password is incorrect.' });
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully.' });
}
