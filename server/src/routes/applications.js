import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';
import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationStats,
  listApplications,
  updateApplication,
} from '../handlers/applications.js';
import { applicationSchema } from '../validations/applications.js';

const router = Router();
router.use(protect);

router.get('/stats', wrap(getApplicationStats));
router.get('/', wrap(listApplications));
router.get('/:id', wrap(getApplication));
router.post('/', validate(applicationSchema), wrap(createApplication));
router.put('/:id', validate(applicationSchema), wrap(updateApplication));
router.delete('/:id', wrap(deleteApplication));

export default router;
