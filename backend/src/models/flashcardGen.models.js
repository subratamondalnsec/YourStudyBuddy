import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardGroup' },
    front: String,
    back: String,
    tags: [String],
    learned: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false }
  });
  
  const FlashcardGroupSchema = new mongoose.Schema({
    title: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    flashcards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard' }],
    createdAt: { type: Date, default: Date.now }
  });


  export const Flashcard = mongoose.model("Flashcard", FlashcardSchema);
  export const FlashcardGroup = mongoose.model("FlashcardGroup", FlashcardGroupSchema);
  