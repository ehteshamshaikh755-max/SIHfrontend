import React, { useMemo, useState } from 'react';
import { useApp } from './AppContext';
import { CATEGORIES, DIFFICULTIES } from './mockData';
import { CourseCard, ProgressBar, EmptyState } from './common';

export default function CourseListing() {
  const { courses, enrollments } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [diff, setDiff] = useState('All');
  const [sort, setSort] = useState('Popular');

  const approved = courses.filter((c) => c.status === 'Approved');

  const filtered = useMemo(() => {
    let list = approved.filter((c) =>
      (cat === 'All' || c.category === cat) &&
      (diff === 'All' || c.difficulty === diff) &&
      (q.trim() === '' || c.title.toLowerCase().includes(q.toLowerCase()) || c.trainer.toLowerCase().includes(q.toLowerCase()))
    );
    if (sort === 'Popular') list = [...list].sort((a, b) => b.learners - a.learners);
    if (sort === 'Rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'Newest') list = [...list].sort((a, b) => (b.submittedOn || '').localeCompare(a.submittedOn || ''));
    return list;
  }, [approved, q, cat, diff, sort]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Browse Courses</h1>
          <p className="desc">{approved.length} approved courses across {CATEGORIES.length} skill areas.</p>
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

      {filtered.length === 0 && <EmptyState icon="🔎" title="No courses match your filters" desc="Try a different category, difficulty, or search term." />}

      <div className="grid grid-3">
        {filtered.map((c) => {
          const enrolled = enrollments[c.id];
          return (
            <CourseCard key={c.id} course={c} linkTo={`/courses/${c.id}`}
              icon={enrolled ? <ProgressBar pct={enrolled.progress} /> : null}
              footer={
                <button className="btn btn-block btn-sm" style={{ background: enrolled ? 'var(--teal-soft)' : 'var(--navy-deep)', color: enrolled ? 'var(--teal)' : '#fff' }}>
                  {enrolled ? (enrolled.progress === 100 ? '✓ Completed — Review' : `Continue (${enrolled.progress}%)`) : 'Enroll'}
                </button>
              } />
          );
        })}
      </div>
    </div>
  );
}
