import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true }, // e.g. "Course Completed — Intro to Cybersecurity"
    amount: { type: Number, required: true }, // positive for earn, negative for redeem
    type: { type: String, enum: ['earn', 'redeem'], required: true },
    icon: { type: String, default: '🎓' },
  },
  { timestamps: { createdAt: 'date', updatedAt: false } }
);

export default mongoose.model('CreditTransaction', creditTransactionSchema);
