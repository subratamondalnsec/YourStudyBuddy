const ReviewScheduleSchema = new mongoose.Schema({
    flashcard: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['new', 'learning', 'reviewing', 'mastered'], default: 'new' },
    nextReviewDate: Date
  });
  