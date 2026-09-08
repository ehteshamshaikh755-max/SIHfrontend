import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: String, default: '' },
    type: { type: String, enum: ['video', 'quiz', 'document'], default: 'video' },
    videoUrl: { type: String, default: '' },
    docUrl: { type: String, default: '' }, // Cloudinary URL for uploaded PDFs/presentations
  },
  { _id: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    lessons: [lessonSchema],
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    user: String,
    rating: Number,
    text: String,
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    q: { type: String, required: true },
    options: [String],
    answer: { type: Number, required: true }, // index of correct option
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    duration: { type: String, default: '' }, // display string e.g. "6h 20m"
    thumbnail: { type: String, default: '' },
    objectives: [String],

    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    featured: { type: Boolean, default: false },
    submittedOn: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },

    rating: { type: Number, default: 0 },
    learners: { type: Number, default: 0 },

    modules: [moduleSchema],
    skillsGained: [String],
    reviews: [reviewSchema],
    quizQuestions: [questionSchema],
    passingScorePct: { type: Number, default: 60 },
    creditsCost: { type: Number, default: 0 }, // 0 = free course, >0 = costs credits to unlock
    quizDeadline: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);