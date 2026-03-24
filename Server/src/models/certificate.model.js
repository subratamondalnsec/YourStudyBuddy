import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  score: Number,
  issuedAt: { type: Date, default: Date.now },
  txHash: String, // Aptos blockchain transaction hash
  metadataUrl: String, // Link to NFT metadata or Aptos Explorer
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
