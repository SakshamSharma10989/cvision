import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  text: String,
  fileUrl: String,
  filename: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;