import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../middleware/error.js';

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  const ok = user && (await bcrypt.compare(req.body.password, user.password));
  if (!ok) throw new ApiError(401, 'Incorrect email or password');
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const getCurrentUser = (req, res) => {
  res.json({ user: publicUser(req.user) });
};
