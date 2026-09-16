import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSessionStore } from '../../context/SessionStore';
import { Alert, ApiError, Badge, EmptyState, Field, PageHeader } from '../../components/ui';
import { classLabel, formatDateTime } from '../../utils/format';

const types = ['general', 'academic', 'exam', 'fee', 'event', 'holiday', 'emergency'];

const emptyForm = {
  title: '',
  message: '',
  type: 'general',
  targetType: 'institution',
  targetClassId: '',
  targetStudentId: '',
};

export default function Announcements() {
  const { data: classes } = useFetch('/api/classes');
  const { data: students } = useFetch('/api/students');
  const { store, push } = useSessionStore();

  const [form, setForm] = useState({ ...emptyForm });
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const announcements = store.announcements || [];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      const res = await api.post('/api/announcements', {
        title: form.title,
        message: form.message,
        type: form.type,
        targetType: form.targetType,
        targetClassId: form.targetType === 'class' ? form.targetClassId : undefined,
        targetStudentId: form.targetType === 'student' ? form.targetStudentId : undefined,
      });
      const cls = classes?.classes?.find((c) => c._id === form.targetClassId);
      const st = students?.students?.find((s) => s._id === form.targetStudentId);
      push('announcements', {
        id: res.announcement._id,
        title: res.announcement.title,
        message: res.announcement.message,
        type: res.announcement.type,
        targetType: res.announcement.targetType,
        targetLabel:
          form.targetType === 'class'
            ? cls ? classLabel(cls) : ''
            : form.targetType === 'student'
              ? st?.userId?.name || st?.name || ''
              : 'Everyone',
        createdAt: new Date().toISOString(),
      });
      setSuccess('Announcement published & notifications queued');
      setForm({ ...emptyForm });
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Publish updates to students, staff and parents" />

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error2} onClose={() => setError2(null)} />

      <div className="grid-2-1">
        <div className="card">
          <div className="card-header"><h3>Compose announcement</h3></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <Field label="Title" required span2>
                  <input className="input" value={form.title} onChange={set('title')} required placeholder="e.g. School reopens on Monday" />
                </Field>
                <Field label="Message" required span2>
                  <textarea className="textarea" value={form.message} onChange={set('message')} required rows={4} />
                </Field>
                <Field label="Type">
                  <select className="select" value={form.type} onChange={set('type')}>
                    {types.map((t) => (
                      <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Target">
                  <select className="select" value={form.targetType} onChange={set('targetType')}>
                    <option value="institution">Everyone (Institution)</option>
                    <option value="class">Specific Class</option>
                    <option value="student">Specific Student</option>
                  </select>
                </Field>
                {form.targetType === 'class' && (
                  <Field label="Class" required span2>
                    <select className="select" value={form.targetClassId} onChange={set('targetClassId')} required>
                      <option value="">— Select class —</option>
                      {classes?.classes?.map((c) => (
                        <option key={c._id} value={c._id}>{classLabel(c)}</option>
                      ))}
                    </select>
                  </Field>
                )}
                {form.targetType === 'student' && (
                  <Field label="Student" required span2>
                    <select className="select" value={form.targetStudentId} onChange={set('targetStudentId')} required>
                      <option value="">— Select student —</option>
                      {(students?.students || []).map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.userId?.name || s.name} · {s.admissionNumber}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Publishing…' : '📣 Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent (this session)</h3></div>
          <div className="card-body" style={{ maxHeight: 480, overflowY: 'auto' }}>
            {announcements.length === 0 ? (
              <EmptyState
                icon="📣"
                title="No announcements published"
                message="Your published announcements will appear here."
              />
            ) : (
              announcements.map((a) => (
                <div key={a.id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <Badge color="violet">{a.type}</Badge>
                  </div>
                  <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{a.message}</div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                    → {a.targetLabel} • {formatDateTime(a.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
