import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSessionStore } from '../../context/SessionStore';
import { Alert, ApiError, EmptyState, Field, NameCell, PageLoader } from '../../components/ui';

const statuses = ['present', 'absent', 'not_appeared'];

export default function TeacherMarks() {
  const { data: dashboard } = useFetch('/api/dashboard/teacher');
  const { data: students, loading } = useFetch('/api/students');
  const { store } = useSessionStore();

  const [examSubjectId, setExamSubjectId] = useState('');
  const [entries, setEntries] = useState({});
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const myAssignments = (dashboard?.assignments || []).map((a) => a._id);
  const examSubjects = (store.examSubjects || []).filter((s) => myAssignments.includes(s.classSubjectId));
  const selected = examSubjects.find((s) => s.id === examSubjectId);

  const buildRows = () => {
    if (!selected || !students) return [];
    const asg = (store.assignments || []).find((a) => a.id === selected.classSubjectId);
    if (!asg) return students.students || [];
    return (students.students || []).filter((s) => (s.classId?._id || s.classId) === asg.classId);
  };
  const list = buildRows();

  const saveAll = async () => {
    setBusy(true);
    setError2(null);
    try {
      let count = 0;
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
        count += 1;
      }
      setSuccess(`Marks saved for ${count} student(s)`);
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
          <h1>My Marks</h1>
          <p>Enter exam marks for your classes</p>
        </div>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error2} onClose={() => setError2(null)} />

      {examSubjects.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState
              icon="✏️"
              title="No exam subjects assigned to you"
              message="When the admin configures exams for your classes, you can enter marks here."
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
            </div>
          </div>

          {selected && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header">
                <h3>Students ({list.length})</h3>
                <button type="button" className="btn btn-primary" onClick={saveAll} disabled={busy || list.length === 0}>
                  {busy ? 'Saving…' : 'Save All Marks'}
                </button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th style={{ width: 120 }}>Marks</th>
                      <th style={{ width: 150 }}>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 && (
                      <tr>
                        <td colSpan={4}><EmptyState icon="🎓" title="No students in this class" /></td>
                      </tr>
                    )}
                    {list.map((st) => {
                      const e = entries[st._id] || {};
                      return (
                        <tr key={st._id}>
                          <td><NameCell name={st.userId?.name || st.name} sub={st.admissionNumber} /></td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={selected.maxMarks}
                              className="input"
                              value={e.marks ?? ''}
                              placeholder="0"
                              onChange={(ev) =>
                                setEntries((prev) => ({ ...prev, [st._id]: { ...prev[st._id], marks: ev.target.value } }))
                              }
                            />
                          </td>
                          <td>
                            <select
                              className="select"
                              value={e.status || 'present'}
                              onChange={(ev) =>
                                setEntries((prev) => ({ ...prev, [st._id]: { ...prev[st._id], status: ev.target.value } }))
                              }
                            >
                              {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                          </td>
                          <td>
                            <input
                              className="input"
                              value={e.remarks || ''}
                              placeholder="Notes"
                              onChange={(ev) =>
                                setEntries((prev) => ({ ...prev, [st._id]: { ...prev[st._id], remarks: ev.target.value } }))
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
        </>
      )}
    </div>
  );
}
