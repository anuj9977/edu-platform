import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSessionStore } from '../../context/SessionStore';
import { Alert, ApiError, Badge, EmptyState, Field, Modal, PageHeader, PageLoader } from '../../components/ui';
import { classLabel } from '../../utils/format';

export default function Assignments() {
  const { data: classes, loading: loadingClasses } = useFetch('/api/classes');
  const { data: subjects } = useFetch('/api/subjects');
  const { data: teachers } = useFetch('/api/teachers');
  const { store, push } = useSessionStore();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ classId: '', subjectId: '', teacherId: '' });
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      const res = await api.post('/api/class-subjects', form);
      const cls = classes?.classes?.find((c) => c._id === form.classId);
      const sub = subjects?.subjects?.find((s) => s._id === form.subjectId);
      const tea = teachers?.teachers?.find((t) => t._id === form.teacherId);
      push('assignments', {
        id: res.assignment._id,
        classId: form.classId,
        subjectId: form.subjectId,
        teacherId: form.teacherId,
        className: cls ? classLabel(cls) : '',
        subjectName: sub?.name || '',
        teacherName: tea?.userId?.name || '',
      });
      setSuccess(`Assigned ${sub?.name} to ${cls ? classLabel(cls) : ''}`);
      setShowCreate(false);
      setForm({ classId: '', subjectId: '', teacherId: '' });
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  if (loadingClasses) return <PageLoader />;

  const assignments = store.assignments || [];

  return (
    <div>
      <PageHeader
        title="Class Assignments"
        subtitle={`${assignments.length} subject-teacher assignments this session`}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Assign Subject
          </button>
        }
      />

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error2} onClose={() => setError2(null)} />

      <div className="card">
        <div className="card-body">
          <Alert type="info">
            Assignments created here are available in this session’s workflows (Exams, Marks, Attendance).
          </Alert>
          {assignments.length === 0 ? (
            <EmptyState
              icon="🧩"
              title="No assignments yet"
              message="Assign a subject and teacher to a class."
              action={
                <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  + Assign Subject
                </button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Assignment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.className}</td>
                      <td>{a.subjectName}</td>
                      <td>{a.teacherName}</td>
                      <td><Badge color="violet">{a.id}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Assign Subject to Class">
        <form onSubmit={handleSubmit}>
          <Field label="Class" required>
            <select className="select" value={form.classId} onChange={set('classId')} required>
              <option value="">— Select class —</option>
              {classes?.classes?.map((c) => (
                <option key={c._id} value={c._id}>{classLabel(c)}</option>
              ))}
            </select>
          </Field>
          <Field label="Subject" required>
            <select className="select" value={form.subjectId} onChange={set('subjectId')} required>
              <option value="">— Select subject —</option>
              {subjects?.subjects?.map((s) => (
                <option key={s._id} value={s._id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>
              ))}
            </select>
          </Field>
          <Field label="Teacher" required>
            <select className="select" value={form.teacherId} onChange={set('teacherId')} required>
              <option value="">— Select teacher —</option>
              {teachers?.teachers?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.userId?.name || t.employeeId} ({t.employeeId})
                </option>
              ))}
            </select>
          </Field>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Assigning…' : 'Assign Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}