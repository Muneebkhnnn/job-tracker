import Application, { STATUSES } from '../models/Application.js';
import { ApiError } from '../middleware/error.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findOwned = async (req) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
  if (!application) throw new ApiError(404, 'Application not found');
  return application;
};

export const getApplicationStats = async (req, res) => {
  const rows = await Application.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const stats = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  rows.forEach((row) => (stats[row._id] = row.count));
  res.json({ stats, total: Object.values(stats).reduce((total, count) => total + count, 0) });
};

export const listApplications = async (req, res) => {
  const filter = { user: req.user._id };
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.search) filter.company = { $regex: escapeRegex(req.query.search), $options: 'i' };
  const applications = await Application.find(filter).sort({ appliedDate: -1, createdAt: -1 });
  res.json({ applications });
};

export const getApplication = async (req, res) => {
  res.json({ application: await findOwned(req) });
};

export const createApplication = async (req, res) => {
  const application = await Application.create({ ...req.body, user: req.user._id });
  res.status(201).json({ application });
};

export const updateApplication = async (req, res) => {
  const application = await findOwned(req);
  Object.assign(application, req.body);
  await application.save();
  res.json({ application });
};

export const deleteApplication = async (req, res) => {
  const application = await findOwned(req);
  await application.deleteOne();
  res.json({ message: 'Application deleted', id: req.params.id });
};
