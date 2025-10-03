import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: String,
  fileUrl: String,
  text: String,
  uploadedAt: { type: Date, default: Date.now },
});


const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;
