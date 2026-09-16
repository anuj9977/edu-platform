import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSessionStore } from '../../context/SessionStore';
import { Alert, ApiError, EmptyState, Field, PageLoader, NameCell } from '../../components/ui';
import { classLabel } from '../../utils/format';

const statuses = ['present', 'absent', 'not_appeared'];

export default function Marks() {
  const { data: students, loading } = useFetch('/api/students');
  const { store } = useSessionStore();
  const examSubjects = store.examSubjects || [];

  const [examSubjectId, setExamSubjectId] = useState('');
  const [entries, setEntries] = useState({});
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saved, setSaved] = useState([]);

  const selected = examSubjects.find((s) => s.id === examSubjectId);

  const classStudents = () => {
    if (!selected || !students) return [];
    const asg = (store.assignments || []).find((a) => a.id === selected.classSubjectId);
    if (!asg) return students.students || [];
    const clsId = asg.classId;
    return (students.students || []).filter((s) => (s.classId?._id || s.classId) === clsId);
  };

  const list = classStudents();

  const handleSave = async () => {
    setBusy(true);
    setError2(null);
    setSaved([]);
    try {
      const done = [];
      for (const st of list) {
        const entry = entries[st._id];
        if (!entry) continue;
        await api.post('/api/marks', {
          examSubjectId: selected.id,
          studentId: st._id,
          marksObtained: Number(entry.marks) || 0,
          remarks: entry.remarks || '',
          status: entry.status || 'present',
        });
        done.push(st.userId?.name || st.name);
      }
      setSaved(done);
      setSuccess(`Marks saved for ${done.length} student(s)`);
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Marks Entry</h1>
          <p>Enter marks for an exam subject per student</p>
        </div>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error2} onClose={() => setError2(null)} />

      {examSubjects.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState
              icon="✏️"
              title="No exam subjects configured"
              message="Create an exam and add subjects to it in the Exams page first."
            />
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-body">
              <Field label="Exam Subject" required>
                <select
                  className="select"
                  value={examSubjectId}
                  onChange={(e) => {
                    setExamSubjectId(e.target.value);
                    setEntries({});
                  }}
                >
                  <option value="">— Select exam subject —</option>
                  {examSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} • {s.examName} (max {s.maxMarks})
                    </option>
                  ))}
                </select>
              </Field>
              {selected && (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Passing marks: <strong>{selected.passingMarks}</strong> • Max marks:{' '}
                  <strong>{selected.maxMarks}</strong>
                </div>
              )}
            </div>
          </div>

          {selected && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header">
                <h3>Students {list.length > 0 ? `(${list.length})` : ''}</h3>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={busy || list.length === 0}
                >
                  {busy ? 'Saving…' : 'Save All Marks'}
                </button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th style={{ width: 120 }}>Marks Obtained</th>
                      <th style={{ width: 140 }}>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <EmptyState
                            icon="🎓"
                            title="No students in this class"
                            message="Assign students to the class for this subject."
                          />
                        </td>
                      </tr>
                    )}
                    {list.map((st) => {
                      const e = entries[st._id] || {};
                      return (
                        <tr key={st._id}>
                          <td>
                            <NameCell name={st.userId?.name || st.name} sub={st.admissionNumber} />
                          </td>
                          <td>{st.classId ? classLabel(st.classId) : '—'}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={selected.maxMarks}
                              className="input"
                              value={e.marks ?? ''}
                              placeholder="0"
                              onChange={(ev) =>
                                setEntries((prev) => ({
                                  ...prev,
                                  [st._id]: { ...prev[st._id], marks: ev.target.value },
                                }))
                              }
                            />
                          </td>
                          <td>
                            <select
                              className="select"
                              value={e.status || 'present'}
                              onChange={(ev) =>
                                setEntries((prev) => ({
                                  ...prev,
                                  [st._id]: { ...prev[st._id], status: ev.target.value },
                                }))
                              }
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              className="input"
                              value={e.remarks || ''}
                              placeholder="Notes"
                              onChange={(ev) =>
                                setEntries((prev) => ({
                                  ...prev,
                                  [st._id]: { ...prev[st._id], remarks: ev.target.value },
                                }))
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {saved.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-body">
                <div className="section-title">✅ Recently saved</div>
                <div className="flex-wrap gap-sm">
                  {saved.map((name) => (
                    <span key={name} className="badge badge-green">{name}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
