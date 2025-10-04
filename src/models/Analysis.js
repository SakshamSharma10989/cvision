import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  result: {
    scores: { overall: { type: Number, default: 0 } },
    missingSkills: { type: [String], default: [] },
  },
  createdAt: { type: Date, default: Date.now, expires: '30d' },
});


const Analysis =
  mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);

export default Analysis;
