import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { ApiError, wrap } from '../middleware/error.js';

const router = Router();

const email = z.string().trim().toLowerCase().email('Enter a valid email address');
const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});
const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  '/signup',
  validate(signupSchema),
  wrap(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

router.post(
  '/login',
  validate(loginSchema),
  wrap(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    const ok = user && (await bcrypt.compare(req.body.password, user.password));
    if (!ok) throw new ApiError(401, 'Incorrect email or password');
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
