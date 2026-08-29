import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import AppLayout from './AppLayout';

import MyCourses from './MyCourses';
import CreateCourse from './CreateCourse';
import ContributionCredits from './ContributionCredits';
import TrainerAnalytics from './TrainerAnalytics';

import AdminDashboard from './AdminDashboard';
import AdminAnalytics from './AdminAnalytics';

import CourseListing from './CourseListing';
import CourseDetails from './CourseDetails';
import LearningPage from './LearningPage';
import Quiz from './Quiz';
import CourseCompletion from './CourseCompletion';

import CreditWallet from './CreditWallet';
import Rewards from './Rewards';
import Achievements from './Achievements';
import Leaderboard from './Leaderboard';
import Certificates from './Certificates';
import Skills from './Skills';

function RoleHome() {
  const { role } = useApp();
  if (role === 'trainer') return <Navigate to="/trainer/courses" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/courses" replace />;
}

function Shell() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<RoleHome />} />

        <Route path="/trainer/courses" element={<MyCourses />} />
        <Route path="/trainer/create" element={<CreateCourse />} />
        <Route path="/trainer/credits" element={<ContributionCredits />} />
        <Route path="/trainer/analytics" element={<TrainerAnalytics />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        <Route path="/courses" element={<CourseListing />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/learn/:courseId/:lessonId" element={<LearningPage />} />
        <Route path="/quiz/:courseId" element={<Quiz />} />
        <Route path="/complete/:courseId" element={<CourseCompletion />} />

        <Route path="/credits" element={<CreditWallet />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/my-skills" element={<Skills />} />

        <Route path="*" element={<RoleHome />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
