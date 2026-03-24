import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },  
  title: String,
  content: String, // Markdown or HTML
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);
