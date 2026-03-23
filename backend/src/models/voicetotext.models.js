const TranscriptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    audioUrl: String,
    transcriptText: String,
    createdAt: { type: Date, default: Date.now }
  });
  