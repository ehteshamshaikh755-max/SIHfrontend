import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp, nextId } from './AppContext';
import { CATEGORIES, DIFFICULTIES } from './mockData';
import { Modal } from './common';

const API_URL = 'https://capacity-connect-backend-wh7n.onrender.com/api';
const STEPS = ['Course Details', 'Content', 'Quiz', 'Preview', 'Submit'];

const CLOUDINARY_CLOUD_NAME = 'cpvcdmgi';
const CLOUDINARY_UPLOAD_PRESET = 'capacity_connect_videos';

const emptyDraft = {
  title: '', description: '', category: CATEGORIES[0], difficulty: DIFFICULTIES[0], duration: '',
  thumbnail: 'navy-teal', objectives: [''], modules: [], skillsGained: [], creditCost: 0,
};

export default function CreateCourse() {
  const { token } = useApp();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(emptyDraft);
  const [courseId, setCourseId] = useState(editId || null);
  const [quiz, setQuiz] = useState([{ id: 'q1', q: '', options: ['', '', '', ''], answer: 0 }]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/courses/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load course');
        setDraft({ ...emptyDraft, ...data, objectives: data.objectives?.length ? data.objectives : [''] });
        if (data.quizQuestions?.length) {
          setQuiz(data.quizQuestions.map((q, i) => ({ id: `q${i}`, ...q })));
        }
      } catch (err) {
        setSaveError(err.message);
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [editId, token]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  function buildPayload(submitForApproval) {
    return {
      title: draft.title,
      description: draft.description,
      category: draft.category,
      difficulty: draft.difficulty,
      duration: draft.duration,
      thumbnail: draft.thumbnail,
      creditCost: Number(draft.creditCost) || 0,
      quizDeadline: draft.quizDeadline || null,
      objectives: draft.objectives.filter(Boolean),
      modules: draft.modules.map((m) => ({
        title: m.title,
        lessons: m.lessons.map((l) => ({
          title: l.title,
          duration: l.duration,
          type: l.type,
          videoUrl: l.videoUrl || '',
          docUrl: l.docUrl || '',
        })),
      })),
      skillsGained: draft.skillsGained,
      quizQuestions: quiz
        .filter((q) => q.q.trim())
        .map((q) => ({ q: q.q, options: q.options, answer: q.answer })),
      submitForApproval: !!submitForApproval,
    };
  }

  async function saveDraft(submitForApproval) {
    setSaving(true);
    setSaveError('');
    try {
      const payload = buildPayload(submitForApproval);
      const url = courseId ? `${API_URL}/courses/${courseId}` : `${API_URL}/courses`;
      const method = courseId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save course');

      if (!courseId) setCourseId(data._id);
      return data._id || courseId;
    } catch (err) {
      setSaveError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  const goStep = async (n) => {
    try {
      await saveDraft(false);
      setStep(n);
    } catch {
      // error already shown via saveError
    }
  };

  const submitCourse = async () => {
    try {
      await saveDraft(true);
      setSubmitted(true);
    } catch {
      // error already shown via saveError
    }
  };

  const saveAsDraftAndExit = async () => {
    try {
      await saveDraft(false);
      nav('/trainer/courses');
    } catch {
      // error already shown via saveError
    }
  };

  if (loadingEdit) {
    return <div className="page"><p className="small muted">Loading course…</p></div>;
  }

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
            <button className="btn btn-accent" onClick={() => { setSubmitted(false); setDraft(emptyDraft); setCourseId(null); setQuiz([{ id: 'q1', q: '', options: ['', '', '', ''], answer: 0 }]); setStep(0); }}>Create Another</button>
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
      {saveError && <p className="small" style={{ color: 'var(--coral)', marginTop: 8 }}>{saveError}</p>}
      {saving && <p className="small muted" style={{ marginTop: 8 }}>Saving…</p>}

      {step === 0 && <DetailsStep draft={draft} set={set} onNext={() => goStep(1)} />}
      {step === 1 && <ContentStep draft={draft} set={set} onBack={() => goStep(0)} onNext={() => goStep(2)} />}
      {step === 2 && <QuizStep quiz={quiz} setQuiz={setQuiz} onBack={() => goStep(1)} onNext={() => goStep(3)} />}
      {step === 3 && <PreviewStep draft={draft} quiz={quiz} onBack={() => goStep(2)} onNext={() => goStep(4)} />}
      {step === 4 && <SubmitStep draft={draft} onBack={() => goStep(3)} onSaveDraft={saveAsDraftAndExit} onSubmit={submitCourse} />}
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
          <label>Credit Cost (optional)</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={draft.creditCost || ''}
            onChange={(e) => set({ creditCost: e.target.value ? Math.max(0, parseInt(e.target.value, 10)) : 0 })}
          />
          <span className="hint">Leave at 0 for free enrollment. Set a value to require trainees to redeem that many CC to unlock this course.</span>
        </div>
        <div className="field">
          <label>Quiz Deadline (optional)</label>
          <input
            type="datetime-local"
            value={draft.quizDeadline ? new Date(draft.quizDeadline).toISOString().slice(0, 16) : ''}
            onChange={(e) => set({ quizDeadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
          />
          <span className="hint">Trainees must complete the quiz before this date/time. Leave blank for no deadline.</span>
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

      <div className="field">
        <label>Skills Gained (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g. Cybersecurity, Threat Awareness"
          value={(draft.skillsGained || []).join(', ')}
          onChange={(e) => set({ skillsGained: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
        />
        <span className="hint">These skills will be added to a trainee's profile when they complete this course.</span>
      </div>

      <StepFooter onNext={onNext} />
      {!valid && <p className="small muted" style={{ marginTop: 8 }}>Fill in title, description and duration to continue.</p>}
    </div>
  );
}

/* ---------------- Step 2: Content (modules + video/document upload) ---------------- */
function ContentStep({ draft, set, onBack, onNext }) {
  const [uploadType, setUploadType] = useState(null); // 'video' | 'document' | null
  const [activeModule, setActiveModule] = useState(null);

  const addModule = () => {
    const m = { id: nextId('m'), title: `Module ${draft.modules.length + 1}`, lessons: [] };
    set({ modules: [...draft.modules, m] });
  };
  const renameModule = (id, title) => set({ modules: draft.modules.map((m) => (m.id === id ? { ...m, title } : m)) });
  const deleteModule = (id) => set({ modules: draft.modules.filter((m) => m.id !== id) });

  const openUploadFor = (moduleId, type) => { setActiveModule(moduleId); setUploadType(type); };

  const addLesson = (moduleId, lesson) => {
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
            <h3 style={{ fontSize: 16 }}>Modules, Videos & Study Materials</h3>
            <p className="small muted">Group lessons into modules, then upload videos or documents (PDFs, presentations) for each.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={addModule}>+ Add Module</button>
        </div>

        {draft.modules.length === 0 && (
          <div className="empty-state"><div className="big-ic">🗂️</div><p className="small">No modules yet — add one to start uploading content.</p></div>
        )}

        <div className="flex-col gap-16" style={{ marginTop: 16 }}>
          {draft.modules.map((m) => (
            <div key={m.id} className="card card-pad" style={{ background: 'var(--paper)' }}>
              <div className="flex gap-8 items-center justify-between" style={{ marginBottom: 10 }}>
                <input type="text" value={m.title} onChange={(e) => renameModule(m.id, e.target.value)} style={{ fontWeight: 700, maxWidth: 320 }} />
                <div className="flex gap-8">
                  <button className="btn btn-accent btn-sm" onClick={() => openUploadFor(m.id, 'video')}>⬆ Upload Video</button>
                  <button className="btn btn-outline btn-sm" onClick={() => openUploadFor(m.id, 'document')}>📄 Upload Document</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteModule(m.id)}>Delete</button>
                </div>
              </div>
              {m.lessons.length === 0 && <p className="small muted">No content in this module yet.</p>}
              {m.lessons.map((l) => (
                <div key={l.id} className="flex justify-between items-center" style={{ padding: '9px 0', borderTop: '1px dashed var(--line)' }}>
                  <div className="flex gap-10 items-center">
                    <span>{l.type === 'quiz' ? '📝' : l.type === 'document' ? '📄' : '🎬'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{l.title}</div>
                      <div className="small muted">{l.duration}{l.description ? ` · ${l.description}` : ''}</div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => openUploadFor(m.id, l.type === 'document' ? 'document' : 'video')}>Replace</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteLesson(m.id, l.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <StepFooter onBack={onBack} onNext={onNext} />
      {totalLessons === 0 && <p className="small muted" style={{ marginTop: 8 }}>Tip: add at least one video or document before continuing.</p>}

      {uploadType === 'video' && (
        <VideoUploadModal
          onClose={() => setUploadType(null)}
          onSave={(lesson) => { addLesson(activeModule, lesson); setUploadType(null); }}
        />
      )}
      {uploadType === 'document' && (
        <DocumentUploadModal
          onClose={() => setUploadType(null)}
          onSave={(lesson) => { addLesson(activeModule, lesson); setUploadType(null); }}
        />
      )}
    </div>
  );
}

// Uploads directly to Cloudinary using an unsigned upload preset, with real
// progress tracking via XMLHttpRequest. On success, videoUrl is the real
// Cloudinary secure_url, saved onto the lesson.
function VideoUploadModal({ onClose, onSave }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationSecs, setDurationSecs] = useState(0);
  const xhrRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, ''));
    setError('');
    setDone(false);
    setProgress(0);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', f);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        setVideoUrl(data.secure_url);
        setDurationSecs(Math.round(data.duration || 0));
        setDone(true);
      } else {
        setError('Upload failed. Please try again.');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError('Upload failed — check your connection and try again.');
    };

    xhr.send(formData);
  };

  useEffect(() => () => xhrRef.current?.abort(), []);

  const durationLabel = () => {
    const m = Math.floor(durationSecs / 60);
    const s = durationSecs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const save = () => {
    onSave({
      id: nextId('l'),
      title: title || 'Untitled Lesson',
      description,
      duration: durationLabel(),
      type: 'video',
      videoUrl,
      fileName: file?.name,
    });
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
              <video src={videoUrl} controls style={{ width: '100%', borderRadius: 8 }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div className="mono" style={{ fontSize: 13 }}>Uploading "{file.name}"…</div>
              </div>
            )}
          </div>
          <div className="flex justify-between small" style={{ marginBottom: 4 }}>
            <span>{uploading ? 'Uploading…' : done ? 'Upload complete' : error ? 'Failed' : 'Queued'}</span>
            <span className="mono">{Math.round(progress)}%</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 16 }}>
            <div className="progress-fill saffron" style={{ width: `${progress}%` }} />
          </div>

          {error && <p className="small" style={{ color: 'var(--coral)', marginBottom: 12 }}>{error}</p>}

          <div className="field">
            <label>Video Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea placeholder="What does this video cover?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { setFile(null); setProgress(0); setDone(false); setUploading(false); setError(''); setVideoUrl(''); }}>Choose a different file</button>
        </div>
      )}
    </Modal>
  );
}

// Uploads a document (PDF/PPT/DOC) to Cloudinary as a raw resource.
function DocumentUploadModal({ onClose, onSave }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const xhrRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, ''));
    setError('');
    setDone(false);
    setProgress(0);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', f);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        setDocUrl(data.secure_url);
        setDone(true);
      } else {
        setError('Upload failed. Please try again.');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError('Upload failed — check your connection and try again.');
    };

    xhr.send(formData);
  };

  useEffect(() => () => xhrRef.current?.abort(), []);

  const save = () => {
    onSave({
      id: nextId('l'),
      title: title || 'Untitled Document',
      description,
      duration: '',
      type: 'document',
      docUrl,
      fileName: file?.name,
    });
  };

  return (
    <Modal title="Upload Document" onClose={onClose} wide
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-accent" disabled={!done || !title.trim()} onClick={save}>Save Document to Module</button>
      </>}>
      {!file && (
        <label className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, border: '2px dashed var(--line)', cursor: 'pointer', background: 'var(--paper)' }}>
          <div style={{ fontSize: 30 }}>📄</div>
          <p style={{ fontWeight: 700, marginTop: 8 }}>Click to select a document</p>
          <p className="small muted">PDF, PPT, DOC or DOCX — up to 100 MB</p>
          <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        </label>
      )}

      {file && (
        <div>
          <div className="flex justify-between small" style={{ marginBottom: 4 }}>
            <span>{uploading ? 'Uploading…' : done ? 'Upload complete' : error ? 'Failed' : 'Queued'}</span>
            <span className="mono">{Math.round(progress)}%</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 16 }}>
            <div className="progress-fill saffron" style={{ width: `${progress}%` }} />
          </div>

          {error && <p className="small" style={{ color: 'var(--coral)', marginBottom: 12 }}>{error}</p>}
          {done && <p className="small" style={{ color: 'var(--teal)', marginBottom: 12 }}>📄 {file.name} uploaded successfully.</p>}

          <div className="field">
            <label>Document Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea placeholder="What does this document cover?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { setFile(null); setProgress(0); setDone(false); setUploading(false); setError(''); setDocUrl(''); }}>Choose a different file</button>
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
          {draft.creditCost > 0 && <span className="pill">🪙 {draft.creditCost} CC to unlock</span>}
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
            {m.lessons.map((l) => (
              <div key={l.id} className="small muted" style={{ paddingLeft: 14 }}>
                {l.type === 'document' ? '📄' : '🎬'} {l.title} {l.duration ? `· ${l.duration}` : ''}
              </div>
            ))}
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