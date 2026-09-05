import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    completedLessonIds: [String], // stores lesson _ids (as strings) the user has finished
    progressPct: { type: Number, default: 0 },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A user can only enroll in a given course once
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
