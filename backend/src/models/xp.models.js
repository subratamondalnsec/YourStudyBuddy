const XPLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activity: String,
    xpGained: Number,
    createdAt: { type: Date, default: Date.now }
  });
  