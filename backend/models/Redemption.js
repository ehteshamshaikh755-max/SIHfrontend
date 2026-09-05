import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
    title: { type: String, required: true }, // snapshot of reward title at time of redemption
    cost: { type: Number, required: true },
    status: { type: String, default: 'Delivered' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model('Redemption', redemptionSchema);
