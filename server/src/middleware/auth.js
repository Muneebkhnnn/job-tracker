import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, wrap } from './error.js';

export const protect = wrap(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please log in to continue');

  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(id);
  if (!user) throw new ApiError(401, 'This account no longer exists');

  req.user = user;
  next();
});
