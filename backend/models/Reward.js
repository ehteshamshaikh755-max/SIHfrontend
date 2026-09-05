import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  cost: { type: Number, required: true },
  icon: { type: String, default: '🎁' },
});

export default mongoose.model('Reward', rewardSchema);
