import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certId: { type: String, required: true, unique: true }, // e.g. CC-2026-DA-88231
    score: { type: Number, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model('Certificate', certificateSchema);
