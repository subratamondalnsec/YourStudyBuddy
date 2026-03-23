import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema({
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    level: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
    fileName: String,
    subject: String,
    content: String,
    wordCount: Number,
    createdAt: { type: Date, default: Date.now }
  });

  export const Summary = mongoose.model("Summary", SummarySchema);