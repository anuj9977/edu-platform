import { useState } from 'react';
import { api } from '../../api/client';
import { useSessionStore } from '../../context/SessionStore';
import { Alert, ApiError, Badge, EmptyState, Field, Modal, PageHeader } from '../../components/ui';

const emptyExam = { name: '', academicYear: '', startDate: '', endDate: '' };

export default function Exams() {
  const { store, push } = useSessionStore();
  const [showExam, setShowExam] = useState(false);
  const [showSubject, setShowSubject] = useState(false);
  const [examForm, setExamForm] = useState({ ...emptyExam });
  const [subjectFormState, setSubjectForm] = useState({
    examId: '', classSubjectId: '', maxMarks: '', passingMarks: '',
  });
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const setExam = (k) => (e) => setExamForm((f) => ({ ...f, [k]: e.target.value }));
  const setSub = (k) => (e) => setSubjectForm((f) => ({ ...f, [k]: e.target.value }));

  const exams = store.exams || [];
  const examSubjects = store.examSubjects || [];
  const assignments = store.assignments || [];

  const createExam = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      const res = await api.post('/api/exams', examForm);
      push('exams', { id: res.exam._id, name: res.exam.name, academicYear: res.exam.academicYear });
      setSuccess(`Exam “${res.exam.name}” created`);
      setShowExam(false);
      setExamForm(emptyExam);
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const addSubject = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      const res = await api.post(`/api/exams/${subjectFormState.examId}/subjects`, {
        classSubjectId: subjectFormState.classSubjectId,
        maxMarks: Number(subjectFormState.maxMarks),
        passingMarks: Number(subjectFormState.passingMarks),
      });
      const asg = assignments.find((a) => a.id === subjectFormState.classSubjectId);
      const exam = exams.find((x) => x.id === subjectFormState.examId);
      push('examSubjects', {
        id: res.examSubject._id,
        examId: subjectFormState.examId,
        classSubjectId: subjectFormState.classSubjectId,
        maxMarks: subjectFormState.maxMarks,
        passingMarks: subjectFormState.passingMarks,
        label: `${asg?.subjectName || 'Subject'} (${asg?.className || ''})`,
        examName: exam?.name || '',
      });
      setSuccess('Subject added to exam');
      setShowSubject(false);
      setSubjectForm({ examId: subjectFormState.examId, classSubjectId: '', maxMarks: '', passingMarks: '' });
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Exams"
        subtitle={`${exams.length} exam(s) • ${examSubjects.length} subject(s) configured`}
        actions={
          <>
            <button
          type="button" className="btn" onClick={() => setShowSubject(true)}
            disabled={exams.length === 0 || assignments.length === 0}
          >
            + Add Subject
          </button>
            <button type="button" className="btn btn-primary" onClick={() => setShowExam(true)}>
              + Create Exam
            </button>
          </>
        }
      />

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error2} onClose={() => setError2(null)} />

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>Exams</h3></div>
          <div className="card-body">
            {exams.length === 0 ? (
              <EmptyState icon="📝" title="No exams yet" message="Create an exam to begin configuring subjects." />
            ) : (
              <ul className="list-plain">
                {exams.map((x) => (
                  <li key={x.id}>
                  <div style={{ fontWeight: 600 }}>{x.name}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{x.academicYear}</div>
                  <span className="lp-value">
                    <Badge color="blue">{examSubjects.filter((s) => s.examId === x.id).length} subjects</Badge>
                  </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Exam subjects</h3></div>
          <div className="card-body">
            {examSubjects.length === 0 ? (
              <EmptyState icon="📚" title="No exam subjects yet" message="Add subjects to an exam." />
            ) : (
              <ul className="list-plain">
                {examSubjects.map((s) => (
                  <li key={s.id}>
                    <span>
                      <div style={{ fontWeight: 600 }}>{s.label}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{s.examName}</div>
                    </span>
                    <span> <Badge color="violet">Max {s.maxMarks}</Badge> </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Modal open={showExam} onClose={() => setShowExam(false)} title="Create Exam">
        <form onSubmit={createExam}>
          <Field label="Exam Name" required>
            <input className="input" value={examForm.name} onChange={setExam('name')} required placeholder="e.g. Mid Term 2025" />
          </Field>
          <Field label="Academic Year" required>
            <input className="input" value={examForm.academicYear} onChange={setExam('academicYear')} required placeholder="e.g. 2025-26" />
          </Field>
          <Field label="Start Date" required>
            <input type="date" className="input" value={examForm.startDate} onChange={setExam('startDate')} required />
          </Field>
          <Field label="End Date" required>
            <input type="date" className="input" value={examForm.endDate} onChange={setExam('endDate')} required />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowExam(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showSubject} onClose={() => setShowSubject(false)} title="Add Subject to Exam">
        <form onSubmit={addSubject}>
          <Field label="Exam" required>
            <select className="select" value={subjectFormState.examId} onChange={setSub('examId')} required>
              <option value="">— Select exam —</option>
              {exams.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.academicYear})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Class Assignment (subject for class)" required>
            <select className="select" value={subjectFormState.classSubjectId} onChange={setSub('classSubjectId')} required>
              <option value="">— Select assignment —</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.subjectName} → {a.className}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Max Marks" required>
            <input type="number" min="1" className="input" value={subjectFormState.maxMarks} onChange={setSub('maxMarks')} required />
          </Field>
          <Field label="Passing Marks" required>
            <input type="number" min="0" className="input" value={subjectFormState.passingMarks} onChange={setSub('passingMarks')} required />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowSubject(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Adding…' : 'Add to Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}