import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSessionStore } from '../../context/SessionStore';
import { Alert, ApiError, Badge, EmptyState, Field, Modal, NameCell, PageHeader, PageLoader } from '../../components/ui';

const emptyForm = { name: '', email: '', password: '', phone: '', occupation: '', address: '', emergencyPhone: '' };

export default function Parents() {
  const { data: students, loading, error } = useFetch('/api/students');
  const { store, push } = useSessionStore();

  const [showCreate, setShowCreate] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [link, setLink] = useState({ parentId: '', studentId: '' });
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      const res = await api.post('/api/parents', form);
      push('parents', {
        id: res.parent.id,
        userId: res.parent.userId,
        name: res.parent.name,
        email: res.parent.email,
        phone: res.parent.phone,
        occupation: form.occupation,
      });
      setSuccess(`Parent “${res.parent.name}” created. Link them to a student next.`);
      setShowCreate(false);
      setForm(emptyForm);
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const handleLink = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.post(`/api/parents/${link.parentId}/students/${link.studentId}`);
      setSuccess('Student linked to parent successfully');
      setShowLink(false);
      setLink({ parentId: '', studentId: '' });
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;

  const parents = store.parents || [];

  return (
    <div>
      <PageHeader
        title="Parents"
        subtitle={`${parents.length} parent(s) created this session`}
        actions={
          <>
            <button type="button" className="btn" onClick={() => setShowLink(true)}>
              🔗 Link to Student
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Add Parent
            </button>
          </>
        }
      />

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error || error2} onClose={() => setError2(null)} />

      <div className="card">
        <div className="card-body">
          <Alert type="info">
            The backend doesn&apos;t expose a list-parents endpoint, so parents created in this
            session are shown here. Use the <strong>Parent ID</strong> to link them to students.
          </Alert>
          {parents.length === 0 ? (
            <EmptyState
              icon="👨‍👩‍👧"
              title="No parents created yet"
              message="Create a parent account first, then link them to their children."
              action={
                <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  + Add Parent
                </button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Parent</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Parent ID</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((p) => (
                    <tr key={p.id}>
                      <td><NameCell name={p.name} sub={p.occupation || 'Parent'} /></td>
                      <td>{p.email}</td>
                      <td>{p.phone || '—'}</td>
                      <td><Badge color="violet">{p.id}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Parent" size="lg">
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <Field label="Full Name" required>
              <input className="input" value={form.name} onChange={set('name')} required />
            </Field>
            <Field label="Email" required>
              <input type="email" className="input" value={form.email} onChange={set('email')} required />
            </Field>
            <Field label="Password" required>
              <input type="password" className="input" value={form.password} onChange={set('password')} minLength={6} required />
            </Field>
            <Field label="Phone" required>
              <input className="input" value={form.phone} onChange={set('phone')} required />
            </Field>
            <Field label="Occupation">
              <input className="input" value={form.occupation} onChange={set('occupation')} />
            </Field>
            <Field label="Emergency Phone">
              <input className="input" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
            </Field>
            <Field label="Address" span2>
              <textarea className="textarea" value={form.address} onChange={set('address')} />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Parent'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showLink} onClose={() => setShowLink(false)} title="Link Parent to Student">
        <form onSubmit={handleLink}>
          <Field label="Parent" required>
            <select className="select" value={link.parentId} onChange={(e) => setLink((l) => ({ ...l, parentId: e.target.value }))} required>
              <option value="">— Select parent —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.id.slice(-8)}</option>
              ))}
            </select>
          </Field>
          <Field label="Student" required>
            <select className="select" value={link.studentId} onChange={(e) => setLink((l) => ({ ...l, studentId: e.target.value }))} required>
              <option value="">— Select student —</option>
              {(students?.students || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.userId?.name || s.name} · {s.admissionNumber}
                </option>
              ))}
            </select>
          </Field>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowLink(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Linking…' : 'Link Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
