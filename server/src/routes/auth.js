import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';
import { getCurrentUser, login, signup } from '../handlers/auth.js';
import { loginSchema, signupSchema } from '../validations/auth.js';

const router = Router();

router.post('/signup', validate(signupSchema), wrap(signup));
router.post('/login', validate(loginSchema), wrap(login));
router.get('/me', protect, getCurrentUser);

export default router;
