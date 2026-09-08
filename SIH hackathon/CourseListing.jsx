import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useApp } from './AppContext';
import { CATEGORIES, DIFFICULTIES } from './mockData';
import { CourseCard, ProgressBar, EmptyState } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';

export default function CourseListing() {
  const { token } = useApp();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [diff, setDiff] = useState('All');
  const [sort, setSort] = useState('Popular');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        fetch(`${API_URL}/courses`),
        fetch(`${API_URL}/enrollments/mine`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const coursesData = await coursesRes.json();
      const enrollData = await enrollRes.json();
      if (!coursesRes.ok) throw new Error(coursesData.message || 'Failed to load courses');
      setCourses(coursesData);
      setEnrollments(enrollRes.ok ? enrollData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const enrollmentFor = (courseId) => enrollments.find((e) => e.course?._id === courseId);

  const filtered = useMemo(() => {
    let list = courses.filter((c) =>
      (cat === 'All' || c.category === cat) &&
      (diff === 'All' || c.difficulty === diff) &&
      (q.trim() === '' || c.title.toLowerCase().includes(q.toLowerCase()) || (c.trainer?.name || '').toLowerCase().includes(q.toLowerCase()))
    );
    if (sort === 'Popular') list = [...list].sort((a, b) => (b.learners || 0) - (a.learners || 0));
    if (sort === 'Rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'Newest') list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [courses, q, cat, diff, sort]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Browse Courses</h1>
          <p className="desc">{courses.length} approved courses across {CATEGORIES.length} skill areas.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="grid grid-4" style={{ gap: 12 }}>
          <input type="text" placeholder="Search courses or trainers…" value={q} onChange={(e) => setQ(e.target.value)} style={{ gridColumn: 'span 2' }} />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={diff} onChange={(e) => setDiff(e.target.value)}>
            <option>All</option>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex justify-between items-center" style={{ marginTop: 12 }}>
          <span className="small muted">{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
          <div className="flex gap-8 items-center">
            <span className="small muted">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 140 }}>
              <option>Popular</option><option>Rating</option><option>Newest</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <p className="small muted">Loading courses…</p>}
      {error && <p className="small" style={{ color: 'var(--coral)' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon="🔎" title="No courses match your filters" desc="Try a different category, difficulty, or search term." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-3">
          {filtered.map((c) => {
            const enrolled = enrollmentFor(c._id);
            return (
              <CourseCard key={c._id} course={{ ...c, id: c._id, trainer: c.trainer?.name || 'Unknown' }} linkTo={`/courses/${c._id}`}
                icon={enrolled ? <ProgressBar pct={enrolled.progressPct} /> : null}
                footer={
                  <button className="btn btn-block btn-sm" style={{ background: enrolled ? 'var(--teal-soft)' : 'var(--navy-deep)', color: enrolled ? 'var(--teal)' : '#fff' }}>
                    {enrolled
                      ? (enrolled.progressPct === 100 ? '✓ Completed — Review' : `Continue (${enrolled.progressPct}%)`)
                      : c.creditsCost > 0
                        ? `🔓 Unlock — ${c.creditsCost} CC`
                        : 'Enroll'}
                  </button>
                } />
            );
          })}
        </div>
      )}
    </div>
  );
}
