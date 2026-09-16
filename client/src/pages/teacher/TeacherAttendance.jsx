import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSessionStore } from '../../context/SessionStore';
import { Alert, ApiError, EmptyState, Field, Modal, NameCell, PageLoader } from '../../components/ui';

const sessionTypes = ['regular', 'extra_class', 'exam'];

export default function TeacherAttendance() {
  const { data: dashboard } = useFetch('/api/dashboard/teacher');
  const { data: students, loading: loadingStudents } = useFetch('/api/students');
  const { push } = useSessionStore();

  const [showCreate, setShowCreate] = useState(false);
  const [sessionForm, setSessionForm] = useState({ classSubjectId: '', date: '', sessionType: 'regular', remarks: '' });
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [records, setRecords] = useState({});
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const setS = (k) => (e) => setSessionForm((f) => ({ ...f, [k]: e.target.value }));
  const setRec = (sid, key, value) =>
    setRecords((prev) => ({ ...prev, [sid]: { ...prev[sid], [key]: value } }));

  const assignments = (dashboard?.assignments || []).map((a) => ({
    id: a._id,
    classId: a.class?._id,
    subjectName: a.subject?.name || '',
    className: `${a.class?.name || ''}${a.class?.section ? '-' + a.class.section : ''}${
      a.class?.academicYear ? ` (${a.class.academicYear})` : ''
    }`,
  }));

  const studentsFor = (asgId) => {
    const asg = assignments.find((a) => a.id === asgId);
    if (!asg?.classId) return [];
    return (students?.students || []).filter((s) => (s.classId?._id || s.classId) === asg.classId);
  };

  const openCreateFor = (asgId) => {
    setSessionForm({ classSubjectId: asgId, date: new Date().toISOString().slice(0, 10), sessionType: 'regular', remarks: '' });
    setAttendanceSession(null);
    setShowCreate(true);
  };

  const createSession = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      const res = await api.post('/api/attendance/sessions', sessionForm);
      const asg = assignments.find((a) => a.id === sessionForm.classSubjectId);
      const init = {};
      studentsFor(sessionForm.classSubjectId).forEach((st) => {
        init[st._id] = { status: 'present', remarks: '' };
      });
      setRecords(init);
      setAttendanceSession({ session: res.session, label: `${asg?.subjectName || ''} (${asg?.className || ''})` });
      push('sessions', {
        id: res.session._id,
        label: `${asg?.subjectName || ''} (${asg?.className || ''})`,
        date: sessionForm.date,
      });
      setSuccess('Attendance session created — mark attendance below');
      setShowCreate(false);
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const markAll = async () => {
    if (!attendanceSession) return;
    setBusy(true);
    setError2(null);
    try {
      const payload = Object.entries(records).map(([sid, rec]) => ({
        studentId: sid,
        status: rec.status,
        remarks: rec.remarks || '',
      }));
      const res = await api.post(`/api/attendance/sessions/${attendanceSession.session._id}/records`, {
        records: payload,
      });
      setSuccess(`Attendance marked for ${res.count} student(s)`);
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  if (loadingStudents) return <PageLoader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Attendance</h1>
          <p>Take attendance for your assigned classes</p>
        </div>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error2} onClose={() => setError2(null)} />

      <div className="card">
        <div className="card-header"><h3>My classes</h3></div>
        <div className="card-body">
          {assignments.length === 0 ? (
            <EmptyState icon="✅" title="No assignments" message="You don't have any class-subject assignments yet." />
          ) : (
            <div className="flex-wrap">
              {assignments.map((a) => (
                <button key={a.id} type="button" className="btn" onClick={() => openCreateFor(a.id)}>
                  ✅ {a.subjectName} → {a.className}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {attendanceSession && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h3>Mark attendance — {attendanceSession.label}</h3>
            <button type="button" className="btn btn-primary" onClick={markAll} disabled={busy}>
              {busy ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {Object.keys(records).length === 0 && (
                  <tr><td colSpan={3}><EmptyState icon="🎓" title="No students in this class" /></td></tr>
                )}
                {Object.keys(records).map((sid) => {
                  const st = (students?.students || []).find((s) => s._id === sid);
                  if (!st) return null;
                  return (
                    <tr key={sid}>
                      <td><NameCell name={st.userId?.name || st.name} sub={st.admissionNumber} /></td>
                      <td style={{ width: 180 }}>
                        <select className="select" value={records[sid].status} onChange={(e) => setRec(sid, 'status', e.target.value)}>
                          {['present', 'absent', 'late', 'excused'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="input"
                          value={records[sid].remarks || ''}
                          onChange={(e) => setRec(sid, 'remarks', e.target.value)}
                          placeholder="Note"
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Start Attendance Session">
        <form onSubmit={createSession}>
          <Field label="Class Assignment" required>
            <select className="select" value={sessionForm.classSubjectId} onChange={setS('classSubjectId')} required>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.subjectName} → {a.className}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" required>
            <input type="date" className="input" value={sessionForm.date} onChange={setS('date')} required />
          </Field>
          <Field label="Session Type">
            <select className="select" value={sessionForm.sessionType} onChange={setS('sessionType')}>
              {sessionTypes.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Field>
          <Field label="Remarks">
            <input className="input" value={sessionForm.remarks} onChange={setS('remarks')} />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
