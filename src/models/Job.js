import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now, expires: '1h' },
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
