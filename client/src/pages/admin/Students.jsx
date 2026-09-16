import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import {
  Alert,
  ApiError,
  EmptyState,
  Field,
  Modal,
  NameCell,
  PageHeader,
  PageLoader,
  statusBadge,
} from '../../components/ui';
import { classLabel, formatDate } from '../../utils/format';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  admissionNumber: '',
  rollNumber: '',
  dateOfBirth: '',
  gender: 'male',
  address: '',
  classId: '',
};

export default function Students() {
  const { data, loading, error, refresh } = useFetch('/api/students');
  const { data: classes } = useFetch('/api/classes');

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setForm(emptyForm);
    setError2(null);
    setShowCreate(true);
  };

  const openEdit = (s) => {
    setForm({
      rollNumber: s.rollNumber || '',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
      gender: s.gender || 'male',
      address: s.address || '',
      classId: s.classId?._id || s.classId || '',
    });
    setError2(null);
    setEditing(s);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.post('/api/students', form);
      setSuccess(`Student “${form.name}” created successfully`);
      setShowCreate(false);
      refresh();
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.put(`/api/students/${editing._id}`, form);
      setSuccess('Student updated successfully');
      setEditing(null);
      refresh();
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/students/${deleting._id}`);
      setSuccess(`Student record deactivated`);
      setDeleting(null);
      refresh();
    } catch (err) {
      setError2(err);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;

  const students = data?.students || [];

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${data?.count ?? students.length} student records`}
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Add Student
          </button>
        }
      />

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error || error2} onClose={() => { setError2(null); }} />

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No.</th>
                <th>Roll No.</th>
                <th>Class</th>
                <th>DOB</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="🎓"
                      title="No students yet"
                      message="Add your first student to get started."
                      action={
                        <button type="button" className="btn btn-primary" onClick={openCreate}>
                          + Add Student
                        </button>
                      }
                    />
                  </td>
                </tr>
              )}
              {students.map((s) => {
                const user = s.userId || {};
                return (
                  <tr key={s._id}>
                    <td>
                      <NameCell name={user.name || s.name || '—'} sub={user.email} />
                    </td>
                    <td>{s.admissionNumber}</td>
                    <td>{s.rollNumber || '—'}</td>
                    <td>{s.classId ? classLabel(s.classId) : '—'}</td>
                    <td>{formatDate(s.dateOfBirth)}</td>
                    <td>{statusBadge(s.status)}</td>
                    <td>
                      <div className="cell-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-sm" onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setDeleting(s)}>
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
</div>

      {/* Create student */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Student" size="lg">
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
            <Field label="Admission Number" required>
              <input className="input" value={form.admissionNumber} onChange={set('admissionNumber')} required />
            </Field>
            <Field label="Roll Number">
              <input className="input" value={form.rollNumber} onChange={set('rollNumber')} />
            </Field>
            <Field label="Class">
              <select className="select" value={form.classId} onChange={set('classId')}>
                <option value="">— None —</option>
                {classes?.classes?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {classLabel(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date of Birth">
              <input type="date" className="input" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </Field>
            <Field label="Gender">
              <select className="select" value={form.gender} onChange={set('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Address" span2>
              <textarea className="textarea" value={form.address} onChange={set('address')} />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit student */}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Student" size="lg">
        <form onSubmit={handleEdit}>
          <div className="form-grid">
            <Field label="Roll Number">
              <input className="input" value={form.rollNumber} onChange={set('rollNumber')} />
            </Field>
            <Field label="Class">
              <select className="select" value={form.classId} onChange={set('classId')}>
                <option value="">— None —</option>
                {classes?.classes?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {classLabel(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date of Birth">
              <input type="date" className="input" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </Field>
            <Field label="Gender">
              <select className="select" value={form.gender} onChange={set('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Address" span2>
              <textarea className="textarea" value={form.address} onChange={set('address')} />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm deactivate */}
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Deactivate student?"
        footer={
          <>
            <button type="button" className="btn" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
              {busy ? 'Deactivating…' : 'Deactivate'}
            </button>
          </>
        }
      >
        <p>
          The login for this student will be disabled and the record marked inactive.
        </p>
      </Modal>
    </div>
  );
}