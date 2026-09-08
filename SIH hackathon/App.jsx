import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import AppLayout from './AppLayout';
import Login from './Login';
import Home from './Home';
import Profile from './Profile';

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
import AIChatWidget from './AIChatWidget';

// Sends a logged-in user to their role's home screen.
function RoleHome() {
  const { role } = useApp();
  if (role === 'trainer') return <Navigate to="/trainer/courses" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'trainee') return <Navigate to="/home" replace />;
  return <Navigate to="/login" replace />;
}

// Wraps a route: if not logged in, bounce to /login.
// If allowedRoles is given, also bounce non-matching roles back to their own home.
function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <RoleHome />;
  return children;
}

function Shell() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/login" element={user ? <RoleHome /> : <Login />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<RoleHome />} />
                <Route path="/profile" element={<Profile />} />

                <Route path="/home" element={<ProtectedRoute allowedRoles={['trainee']}><Home /></ProtectedRoute>} />
                <Route path="/trainer/courses" element={<ProtectedRoute allowedRoles={['trainer']}><MyCourses /></ProtectedRoute>} />
                <Route path="/trainer/create" element={<ProtectedRoute allowedRoles={['trainer']}><CreateCourse /></ProtectedRoute>} />
                <Route path="/trainer/credits" element={<ProtectedRoute allowedRoles={['trainer']}><ContributionCredits /></ProtectedRoute>} />
                <Route path="/trainer/analytics" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerAnalytics /></ProtectedRoute>} />

                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

                <Route path="/courses" element={<ProtectedRoute allowedRoles={['trainee']}><CourseListing /></ProtectedRoute>} />
                <Route path="/courses/:id" element={<ProtectedRoute allowedRoles={['trainee']}><CourseDetails /></ProtectedRoute>} />
                <Route path="/learn/:courseId/:lessonId" element={<ProtectedRoute allowedRoles={['trainee']}><LearningPage /></ProtectedRoute>} />
                <Route path="/quiz/:courseId" element={<ProtectedRoute allowedRoles={['trainee']}><Quiz /></ProtectedRoute>} />
                <Route path="/complete/:courseId" element={<ProtectedRoute allowedRoles={['trainee']}><CourseCompletion /></ProtectedRoute>} />

                <Route path="/credits" element={<ProtectedRoute allowedRoles={['trainee']}><CreditWallet /></ProtectedRoute>} />
                <Route path="/rewards" element={<ProtectedRoute allowedRoles={['trainee']}><Rewards /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute allowedRoles={['trainee']}><Achievements /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/certificates" element={<ProtectedRoute allowedRoles={['trainee']}><Certificates /></ProtectedRoute>} />
                <Route path="/my-skills" element={<ProtectedRoute allowedRoles={['trainee']}><Skills /></ProtectedRoute>} />

                <Route path="*" element={<RoleHome />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
      <AIChatWidget />
    </AppProvider>
  );
}