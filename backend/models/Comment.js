import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ['trainee', 'trainer'], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);