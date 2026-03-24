import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },  
  title: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // Markdown or HTML
}, { timestamps: true });

export default mongoose.model('Module', moduleSchema);
