import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, required: true }, // percentage, e.g. 80
    passed: { type: Boolean, required: true },
    answers: [Number], // the option index the user picked for each question, in order
  },
  { timestamps: { createdAt: 'attemptedAt', updatedAt: false } }
);

export default mongoose.model('QuizAttempt', quizAttemptSchema);
