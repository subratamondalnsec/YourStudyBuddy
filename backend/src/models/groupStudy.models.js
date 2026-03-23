const StudyGroupSchema = new mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    flashcardGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardGroup' }]
  });
  