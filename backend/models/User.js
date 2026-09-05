import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ['trainee', 'trainer', 'admin'], required: true },
    dept: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    workExperience: { type: String, default: '' },
    interests: { type: String, default: '' },

    // Trainees are auto-approved. Trainers need admin approval before they can log in.
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function () {
        return this.role === 'trainer' ? 'pending' : 'approved';
      },
    },

    credits: { type: Number, default: 0 }, // trainee wallet balance
    contributionCredits: { type: Number, default: 0 }, // trainer wallet balance

    skills: [
      {
        name: String,
        pct: { type: Number, default: 0 },
      },
    ],

    // Trainer subject-matter competencies, used for admin competency mapping
    // (identifying suitable trainers for a given subject/category).
    trainerCompetencies: [
      {
        subject: String,
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);