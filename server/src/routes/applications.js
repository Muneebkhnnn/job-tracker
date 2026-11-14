import { Router } from 'express';
import { z } from 'zod';
import Application, { STATUSES } from '../models/Application.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { ApiError, wrap } from '../middleware/error.js';

const router = Router();
router.use(protect); // every route below is private

const applicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(100),
  role: z.string().trim().min(1, 'Role is required').max(100),
  status: z.enum(STATUSES, { errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}` }) }).default('Applied'),
  appliedDate: z.coerce.date({ errorMap: () => ({ message: 'Enter a valid date' }) }),
  notes: z.string().trim().max(1000, 'Notes must be 1000 characters or fewer').optional().default(''),
});

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Always scoped to the logged-in user, so nobody can read or edit someone else's data.
const findOwned = async (req) => {
  const doc = await Application.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) throw new ApiError(404, 'Application not found');
  return doc;
};

router.get(
  '/stats',
  wrap(async (req, res) => {
    const rows = await Application.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    rows.forEach((r) => (stats[r._id] = r.count));
    res.json({ stats, total: Object.values(stats).reduce((a, b) => a + b, 0) });
  })
);

router.get(
  '/',
  wrap(async (req, res) => {
    const filter = { user: req.user._id };
    if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.search) filter.company = { $regex: escapeRegex(req.query.search), $options: 'i' };
    const applications = await Application.find(filter).sort({ appliedDate: -1, createdAt: -1 });
    res.json({ applications });
  })
);

router.get('/:id', wrap(async (req, res) => res.json({ application: await findOwned(req) })));

router.post(
  '/',
  validate(applicationSchema),
  wrap(async (req, res) => {
    const application = await Application.create({ ...req.body, user: req.user._id });
    res.status(201).json({ application });
  })
);

router.put(
  '/:id',
  validate(applicationSchema),
  wrap(async (req, res) => {
    const application = await findOwned(req);
    Object.assign(application, req.body);
    await application.save();
    res.json({ application });
  })
);

router.delete(
  '/:id',
  wrap(async (req, res) => {
    const application = await findOwned(req);
    await application.deleteOne();
    res.json({ message: 'Application deleted', id: req.params.id });
  })
);

export default router;
