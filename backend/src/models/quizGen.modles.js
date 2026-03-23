import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], 
    attempts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attempt' }]
}, {
    timestamps: true  
  });
  
  const QuestionSchema = new mongoose.Schema({
    type: { type: String, enum: ['mcq', 'truefalse'] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    topic: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    explanation: String
  });
  
  const attemptsSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    takenAt: Date,
    timeTaken: Number,
    answers: [{
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      isattempted: Boolean,
      topic: String,
      selectedAnswer: String,
      isCorrect: Boolean
    }]
  });

  const Quiz = mongoose.model('Quiz', QuizSchema);
  const Question = mongoose.model('Question', QuestionSchema);
  const Attempt = mongoose.model('Attempt', attemptsSchema);

export { Quiz, Question, Attempt };