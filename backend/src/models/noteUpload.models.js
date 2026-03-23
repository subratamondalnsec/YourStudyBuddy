import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: String,
    fileType: String,
    fileUrl: String,
    subject: String,
    uploadDate: { type: Date, default: Date.now },
    previewText: {type : String, default: "None"},
    summaryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Summary' }],
    flashcardGroup: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardGroup' }],
    quiz: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  });
  

  export const Note = mongoose.model("Note", NoteSchema);