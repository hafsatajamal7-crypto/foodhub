import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: 'Sign in to continue.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Account not found.' });
    if (user.isBlocked) return res.status(403).json({ message: 'This account is currently blocked.' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or expired.' });
  }
}
