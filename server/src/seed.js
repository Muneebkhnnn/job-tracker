import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Application from './models/Application.js';

const day = (n) => new Date(Date.now() - n * 86400000);
const samples = [
  ['Razorpay', 'Frontend Engineer', 'Interview', 4, 'Round 2 on Thursday. Revise React rendering.'],
  ['Zoho', 'Full Stack Developer', 'Applied', 6, ''],
  ['Swiggy', 'Software Engineer I', 'Applied', 9, 'Referred by a former colleague.'],
  ['Freshworks', 'Node.js Developer', 'Offer', 21, 'Offer received. Deadline to reply is next week.'],
  ['CRED', 'React Developer', 'Rejected', 30, 'Did not clear the DSA round.'],
  ['Postman', 'Associate Engineer', 'Wishlist', 1, 'Opens applications next month.'],
  ['Groww', 'Backend Engineer', 'Interview', 12, 'System design round done.'],
];

await mongoose.connect(process.env.MONGO_URI);
await User.deleteOne({ email: 'demo@jobtracker.dev' });
const user = await User.create({
  name: 'Demo User',
  email: 'demo@jobtracker.dev',
  password: await bcrypt.hash('Demo@1234', 10),
});
await Application.insertMany(
  samples.map(([company, role, status, ago, notes]) => ({ user: user._id, company, role, status, appliedDate: day(ago), notes }))
);
console.log('Seeded demo@jobtracker.dev / Demo@1234');
await mongoose.disconnect();
