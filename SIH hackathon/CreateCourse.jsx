import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp, nextId } from './AppContext';
import { CATEGORIES, DIFFICULTIES } from './mockData';
import { Modal } from './common';

const STEPS = ['Course Details', 'Content', 'Quiz', 'Preview', 'Submit'];
const TRAINER_NAME = 'Dr. Anika Rao';

const emptyDraft = {
  title: '', description: '', category: CATEGORIES[0], difficulty: DIFFICULTIES[0], duration: '',
  thumbnail: 'navy-teal', objectives: [''], modules: [], skillsGained: [],
};

export default function CreateCourse() {
  const { courses, addCourse, updateCourse, submitForApproval } = useApp();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(emptyDraft);
  const [courseId, setCourseId] = useState(editId || null);
  const [quiz, setQuiz] = useState([{ id: 'q1', q: '', options: ['', '', '', ''], answer: 0 }]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editId) {
      const c = courses.find((x) => x.id === editId);
      if (c) setDraft({ ...emptyDraft, ...c });
    }
  }, [editId]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const saveDraft = (statusOverride) => {
    if (courseId) {
      updateCourse(courseId, { ...draft, trainer: TRAINER_NAME, ...(statusOverride ? { status: statusOverride } : {}) });
      return courseId;
    }
    const id = addCourse({ ...draft, trainer: TRAINER_NAME });
    setCourseId(id);
    return id;
  };

  const goStep = (n) => { saveDraft(); setStep(n); };

  const submitCourse = () => {
    const id = saveDraft();
    submitForApproval(id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="card card-pad" style={{ textAlign: 'center', maxWidth: 520, margin: '40px auto' }}>
          <div style={{ fontSize: 42 }}>📨</div>
          <h2 style={{ marginTop: 10 }}>Course Submitted for Approval</h2>
          <p className="muted small" style={{ marginTop: 8 }}>
            "{draft.title}" has been sent to the Admin review queue. You'll be notified once it's approved or if changes are requested.
          </p>
          <div className="flex gap-10" style={{ marginTop: 20, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => nav('/trainer/courses')}>Back to My Courses</button>
            <button className="btn btn-accent" onClick={() => { setSubmitted(false); setDraft(emptyDraft); setCourseId(null); setStep(0); }}>Create Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 920 }}>
      <div className="page-head">
        <div>
          <h1>{editId ? 'Edit Course' : 'Create New Course'}</h1>
          <p className="desc">Course Details → Content → Quiz → Preview → Submit</p>
        </div>
      </div>

      <Stepper step={step} />

      {step === 0 && <DetailsStep draft={draft} set={set} onNext={() => goStep(1)} />}
      {step === 1 && <ContentStep draft={draft} set={set} onBack={() => goStep(0)} onNext={() => goStep(2)} />}
      {step === 2 && <QuizStep quiz={quiz} setQuiz={setQuiz} onBack={() => goStep(1)} onNext={() => goStep(3)} />}
      {step === 3 && <PreviewStep draft={draft} quiz={quiz} onBack={() => goStep(2)} onNext={() => goStep(4)} />}
      {step === 4 && <SubmitStep draft={draft} onBack={() => goStep(3)} onSaveDraft={() => { saveDraft('Draft'); nav('/trainer/courses'); }} onSubmit={submitCourse} />}
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="num">{i < step ? '✓' : i + 1}</div>
            <div className="label">{s}</div>
          </div>
          {i < STEPS.length - 1 && <div className="step-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function StepFooter({ onBack, onNext, nextLabel }) {
  return (
    <div className="flex justify-between" style={{ marginTop: 22 }}>
      {onBack ? <button className="btn btn-outline" onClick={onBack}>← Back</button> : <span />}
      <button className="btn btn-accent" onClick={onNext}>{nextLabel || 'Continue →'}</button>
    </div>
  );
}

/* ---------------- Step 1: Details ---------------- */
function DetailsStep({ draft, set, onNext }) {
  const setObjective = (i, val) => {
    const arr = [...draft.objectives]; arr[i] = val; set({ objectives: arr });
  };
  const addObjective = () => set({ objectives: [...draft.objectives, ''] });
  const removeObjective = (i) => set({ objectives: draft.objectives.filter((_, idx) => idx !== i) });

  const valid = draft.title.trim() && draft.description.trim() && draft.duration.trim();

  return (
    <div className="card card-pad">
      <div className="grid grid-2">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Course Title</label>
          <input type="text" placeholder="e.g. Foundations of Data Analytics for Public Administration" value={draft.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <textarea placeholder="What will trainees learn, and why does it matter?" value={draft.description} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={draft.category} onChange={(e) => set({ category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Difficulty</label>
          <select value={draft.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Estimated Duration</label>
          <input type="text" placeholder="e.g. 6h 20m" value={draft.duration} onChange={(e) => set({ duration: e.target.value })} />
        </div>
        <div className="field">
          <label>Thumbnail Style</label>
          <select value={draft.thumbnail} onChange={(e) => set({ thumbnail: e.target.value })}>
            <option value="navy-teal">Navy → Teal</option>
            <option value="coral-navy">Coral → Navy</option>
            <option value="saffron-navy">Saffron → Navy</option>
            <option value="teal-navy">Teal → Navy</option>
            <option value="navy-saffron">Navy → Saffron</option>
          </select>
          <span className="hint">Thumbnail upload is simulated in this prototype — a style stands in for an uploaded image.</span>
        </div>
      </div>

      <div className="field">
        <label>Learning Objectives</label>
        {draft.objectives.map((obj, i) => (
          <div key={i} className="flex gap-8" style={{ marginBottom: 8 }}>
            <input type="text" placeholder={`Objective ${i + 1}`} value={obj} onChange={(e) => setObjective(i, e.target.value)} />
            {draft.objectives.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => removeObjective(i)}>✕</button>}
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addObjective}>+ Add Objective</button>
      </div>

      <StepFooter onNext={onNext} />
      {!valid && <p className="small muted" style={{ marginTop: 8 }}>Fill in title, description and duration to continue.</p>}
    </div>
  );
}

/* ---------------- Step 2: Content (modules + video upload) ---------------- */
function ContentStep({ draft, set, onBack, onNext }) {
  const [showUpload, setShowUpload] = useState(false);
  const [activeModule, setActiveModule] = useState(null);

  const addModule = () => {
    const m = { id: nextId('m'), title: `Module ${draft.modules.length + 1}`, lessons: [] };
    set({ modules: [...draft.modules, m] });
  };
  const renameModule = (id, title) => set({ modules: draft.modules.map((m) => (m.id === id ? { ...m, title } : m)) });
  const deleteModule = (id) => set({ modules: draft.modules.filter((m) => m.id !== id) });

  const openUploadFor = (moduleId) => { setActiveModule(moduleId); setShowUpload(true); };

  const addVideoLesson = (moduleId, lesson) => {
    set({
      modules: draft.modules.map((m) => (m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m)),
    });
  };
  const deleteLesson = (moduleId, lessonId) => {
    set({ modules: draft.modules.map((m) => (m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m)) });
  };

  const totalLessons = draft.modules.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div>
      <div className="card card-pad">
        <div className="flex justify-between items-center">
          <div>
            <h3 style={{ fontSize: 16 }}>Modules & Videos</h3>
            <p className="small muted">Group lessons into modules, then upload a video for each lesson.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={addModule}>+ Add Module</button>
        </div>

        {draft.modules.length === 0 && (
          <div className="empty-state"><div className="big-ic">🗂️</div><p className="small">No modules yet — add one to start uploading videos.</p></div>
        )}

        <div className="flex-col gap-16" style={{ marginTop: 16 }}>
          {draft.modules.map((m) => (
            <div key={m.id} className="card card-pad" style={{ background: 'var(--paper)' }}>
              <div className="flex gap-8 items-center justify-between" style={{ marginBottom: 10 }}>
                <input type="text" value={m.title} onChange={(e) => renameModule(m.id, e.target.value)} style={{ fontWeight: 700, maxWidth: 320 }} />
                <div className="flex gap-8">
                  <button className="btn btn-accent btn-sm" onClick={() => openUploadFor(m.id)}>⬆ Upload Video</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteModule(m.id)}>Delete</button>
                </div>
              </div>
              {m.lessons.length === 0 && <p className="small muted">No videos in this module yet.</p>}
              {m.lessons.map((l) => (
                <div key={l.id} className="flex justify-between items-center" style={{ padding: '9px 0', borderTop: '1px dashed var(--line)' }}>
                  <div className="flex gap-10 items-center">
                    <span>{l.type === 'quiz' ? '📝' : '🎬'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{l.title}</div>
                      <div className="small muted">{l.duration}{l.description ? ` · ${l.description}` : ''}</div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => openUploadFor(m.id)}>Replace</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteLesson(m.id, l.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} />
      {totalLessons === 0 && <p className="small muted" style={{ marginTop: 8 }}>Tip: add at least one video before continuing.</p>}

      {showUpload && (
        <VideoUploadModal
          onClose={() => setShowUpload(false)}
          onSave={(lesson) => { addVideoLesson(activeModule, lesson); setShowUpload(false); }}
        />
      )}
    </div>
  );
}

function VideoUploadModal({ onClose, onSave }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const timerRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, ''));
    setUploading(true);
    setProgress(0);
    setDone(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.random() * 18 + 6);
        if (next >= 100) { clearInterval(timerRef.current); setUploading(false); setDone(true); }
        return next;
      });
    }, 300);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const durationLabel = () => {
    const secs = file ? Math.max(60, Math.round((file.size / 1024 / 1024) * 12)) : 0;
    const m = Math.floor(secs / 60); const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const save = () => {
    onSave({ id: nextId('l'), title: title || 'Untitled Lesson', description, duration: durationLabel(), type: 'video', fileName: file?.name });
  };

  return (
    <Modal title="Upload Video" onClose={onClose} wide
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-accent" disabled={!done || !title.trim()} onClick={save}>Save Video to Module</button>
      </>}>
      {!file && (
        <label className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, border: '2px dashed var(--line)', cursor: 'pointer', background: 'var(--paper)' }}>
          <div style={{ fontSize: 30 }}>🎥</div>
          <p style={{ fontWeight: 700, marginTop: 8 }}>Click to select a video file</p>
          <p className="small muted">MP4, MOV or WEBM — up to 2 GB</p>
          <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        </label>
      )}

      {file && (
        <div>
          <div className="video-player" style={{ marginBottom: 14 }}>
            {done ? (
              <div className="play-btn">▶</div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 13 }}>Uploading “{file.name}”…</div>
              </div>
            )}
          </div>
          <div className="flex justify-between small" style={{ marginBottom: 4 }}>
            <span>{uploading ? 'Uploading…' : done ? 'Upload complete' : 'Queued'}</span>
            <span className="mono">{Math.round(progress)}%</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 16 }}>
            <div className="progress-fill saffron" style={{ width: `${progress}%` }} />
          </div>

          <div className="field">
            <label>Video Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea placeholder="What does this video cover?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { setFile(null); setProgress(0); setDone(false); setUploading(false); }}>Choose a different file</button>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- Step 3: Quiz ---------------- */
function QuizStep({ quiz, setQuiz, onBack, onNext }) {
  const addQ = () => setQuiz([...quiz, { id: nextId('q'), q: '', options: ['', '', '', ''], answer: 0 }]);
  const removeQ = (id) => setQuiz(quiz.filter((q) => q.id !== id));
  const update = (id, patch) => setQuiz(quiz.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const updateOpt = (id, idx, val) => setQuiz(quiz.map((q) => (q.id === id ? { ...q, options: q.options.map((o, i) => (i === idx ? val : o)) } : q)));

  return (
    <div>
      <div className="card card-pad">
        <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: 16 }}>Course Quiz</h3>
            <p className="small muted">Add MCQs learners must pass to complete the course.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={addQ}>+ Add Question</button>
        </div>
        {quiz.map((q, i) => (
          <div key={q.id} className="card card-pad" style={{ background: 'var(--paper)', marginBottom: 12 }}>
            <div className="flex justify-between items-center">
              <label style={{ fontWeight: 700 }}>Question {i + 1}</label>
              {quiz.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => removeQ(q.id)}>✕ Remove</button>}
            </div>
            <input type="text" placeholder="Type the question" value={q.q} onChange={(e) => update(q.id, { q: e.target.value })} style={{ margin: '8px 0 12px' }} />
            {q.options.map((opt, idx) => (
              <div key={idx} className="flex gap-10 items-center" style={{ marginBottom: 8 }}>
                <input type="radio" name={`ans-${q.id}`} checked={q.answer === idx} onChange={() => update(q.id, { answer: idx })} />
                <input type="text" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => updateOpt(q.id, idx, e.target.value)} />
              </div>
            ))}
            <p className="small muted">Select the radio button next to the correct answer.</p>
          </div>
        ))}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}

/* ---------------- Step 4: Preview ---------------- */
function PreviewStep({ draft, quiz, onBack, onNext }) {
  return (
    <div>
      <div className="card card-pad">
        <span className="pill">Preview — this is how trainees will see it</span>
        <h2 style={{ marginTop: 12 }}>{draft.title || 'Untitled Course'}</h2>
        <p className="muted" style={{ marginTop: 6 }}>{draft.description || 'No description provided.'}</p>
        <div className="flex gap-16 wrap" style={{ marginTop: 12 }}>
          <span className="pill">{draft.category}</span>
          <span className="pill">{draft.difficulty}</span>
          <span className="pill">⏱ {draft.duration || '—'}</span>
          <span className="pill">{draft.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons</span>
          <span className="pill">{quiz.length} quiz questions</span>
        </div>

        <div className="divider" />
        <h3 style={{ fontSize: 15 }}>Learning Objectives</h3>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          {draft.objectives.filter(Boolean).map((o, i) => <li key={i} className="small" style={{ marginBottom: 4 }}>{o}</li>)}
        </ul>

        <div className="divider" />
        <h3 style={{ fontSize: 15, marginBottom: 8 }}>Modules</h3>
        {draft.modules.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.title}</div>
            {m.lessons.map((l) => <div key={l.id} className="small muted" style={{ paddingLeft: 14 }}>🎬 {l.title} · {l.duration}</div>)}
          </div>
        ))}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextLabel="Continue to Submit →" />
    </div>
  );
}

/* ---------------- Step 5: Submit ---------------- */
function SubmitStep({ draft, onBack, onSaveDraft, onSubmit }) {
  return (
    <div className="card card-pad" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 36 }}>🚀</div>
      <h3 style={{ marginTop: 10 }}>Ready to submit “{draft.title || 'Untitled Course'}”?</h3>
      <p className="small muted" style={{ marginTop: 6, maxWidth: 460, margin: '6px auto 0' }}>
        Submitting sends this course to the Admin review queue for approval. You can also save it as a draft and come back later.
      </p>
      <div className="flex gap-12" style={{ justifyContent: 'center', marginTop: 22 }}>
        <button className="btn btn-outline" onClick={onBack}>← Back to Preview</button>
        <button className="btn btn-outline" onClick={onSaveDraft}>Save as Draft</button>
        <button className="btn btn-accent" onClick={onSubmit}>Submit for Approval</button>
      </div>
    </div>
  );
}
