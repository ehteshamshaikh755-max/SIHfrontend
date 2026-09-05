import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { initialCourses } from './mockData';

const AppCtx = createContext(null);
const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

let idCounter = 100;
export const nextId = (prefix) => `${prefix}-${idCounter++}`;

export function AppProvider({ children }) {
  // ---- Real auth state (replaces the old hardcoded role toggle) ----
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cc_token') || null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const role = user?.role || null; // 'trainee' | 'trainer' | 'admin' | null (not logged in)

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('cc_user', JSON.stringify(user));
      localStorage.setItem('cc_token', token);
    } else {
      localStorage.removeItem('cc_user');
      localStorage.removeItem('cc_token');
    }
  }, [user, token]);

  async function login(email, password) {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Login failed');
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      return true;
    } catch (err) {
      setAuthError('Could not reach the server. Is the backend running?');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }

  async function signup(name, email, password, signupRole, dept) {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: signupRole, dept }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.message || 'Signup failed');
        return { ok: false };
      }
      if (data.pendingApproval) {
        // Trainer signups don't get a token yet — they must wait for admin approval
        return { ok: true, pendingApproval: true };
      }
      setUser(data.user);
      setToken(data.token);
      return { ok: true, pendingApproval: false };
    } catch (err) {
      setAuthError('Could not reach the server. Is the backend running?');
      return { ok: false };
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
  }
  function updateUser(updatedFields) 
  {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  }

  // ---- Existing mock-data-driven state (unchanged for now) ----
  const [courses, setCourses] = useState(initialCourses);
  const [enrollments, setEnrollments] = useState({ c1: { progress: 40, completedLessons: ['l1', 'l2'] }, c4: { progress: 100, completedLessons: ['l1', 'l2', 'l3', 'l4'] } });
  const [traineeBalance, setTraineeBalance] = useState(1250);
  const [trainerBalance, setTrainerBalance] = useState(680);

  const addCourse = (course) => {
    const id = nextId('c');
    setCourses((prev) => [...prev, { ...course, id, status: 'Draft', rating: 0, learners: 0, submittedOn: null, reviews: [] }]);
    return id;
  };
  const updateCourse = (id, patch) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const deleteCourse = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };
  const submitForApproval = (id) => {
    updateCourse(id, { status: 'Pending Approval', submittedOn: new Date().toISOString().slice(0, 10), rejectionReason: null });
  };
  const approveCourse = (id) => {
    updateCourse(id, { status: 'Approved', rejectionReason: null });
    setTrainerBalance((b) => b + 150);
  };
  const rejectCourse = (id, reason) => {
    updateCourse(id, { status: 'Rejected', rejectionReason: reason });
  };

  const enroll = (courseId) => {
    setEnrollments((prev) => ({ ...prev, [courseId]: prev[courseId] || { progress: 0, completedLessons: [] } }));
  };
  const markLessonComplete = (courseId, lessonId, totalLessons) => {
    setEnrollments((prev) => {
      const cur = prev[courseId] || { progress: 0, completedLessons: [] };
      const completed = cur.completedLessons.includes(lessonId) ? cur.completedLessons : [...cur.completedLessons, lessonId];
      const progress = Math.round((completed.length / totalLessons) * 100);
      return { ...prev, [courseId]: { progress, completedLessons: completed } };
    });
  };

  const value = useMemo(() => ({
    // auth
    user, token, role, login, signup, logout, updateUser, authError, authLoading, setAuthError,
    // existing mock state
    courses, addCourse, updateCourse, deleteCourse, submitForApproval, approveCourse, rejectCourse,
    enrollments, enroll, markLessonComplete,
    traineeBalance, setTraineeBalance,
    trainerBalance, setTrainerBalance,
  }), [user, token, role, authError, authLoading, courses, enrollments, traineeBalance, trainerBalance]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
