import React, { createContext, useContext, useState, useMemo } from 'react';
import { initialCourses } from './mockData';

const AppCtx = createContext(null);

let idCounter = 100;
export const nextId = (prefix) => `${prefix}-${idCounter++}`;

export function AppProvider({ children }) {
  const [role, setRole] = useState('trainer'); // trainer | admin | trainee
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
    role, setRole,
    courses, addCourse, updateCourse, deleteCourse, submitForApproval, approveCourse, rejectCourse,
    enrollments, enroll, markLessonComplete,
    traineeBalance, setTraineeBalance,
    trainerBalance, setTrainerBalance,
  }), [role, courses, enrollments, traineeBalance, trainerBalance]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
