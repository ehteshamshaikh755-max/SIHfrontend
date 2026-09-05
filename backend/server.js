import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import redemptionRoutes from './routes/redemptionRoutes.js';
import skillsRoutes from './routes/skillsRoutes.js';
import achievementsRoutes from './routes/achievementsRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import trainerStatsRoutes from './routes/trainerStatsRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import homeRoutes from './routes/homeRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/trainer-stats', trainerStatsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/home', homeRoutes);

app.get('/', (req, res) => res.send('Capacity Connect API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
