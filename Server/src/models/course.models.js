import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: String,
  topic: String,
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  isPublic: { type: Boolean, default: true },
  generatedByAI: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
