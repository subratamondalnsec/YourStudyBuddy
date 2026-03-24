import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  currentLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  xpEarned: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
