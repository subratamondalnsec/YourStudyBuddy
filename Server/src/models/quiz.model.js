import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: Number, // index of the correct answer
    }
  ]
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
