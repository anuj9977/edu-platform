import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSessionStore } from '../../context/SessionStore';
import { ApiError, Badge, EmptyState, Field, PageLoader } from '../../components/ui';
import { classLabel } from '../../utils/format';

export default function Results() {
  const { data: students, loading } = useFetch('/api/students');
  const { store } = useSessionStore();
  const exams = store.exams || [];

  const [studentId, setStudentId] = useState('');
  const [examId, setExamId] = useState('');
  const [result, setResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error2, setError2] = useState(null);

  const loadResult = async () => {
    if (!studentId || !examId) return;
    setLoadingResult(true);
    setError2(null);
    try {
      const res = await api.get(`/api/results/student/${studentId}?examId=${examId}`);
      setResult(res);
    } catch (err) {
      setError2(err);
      setResult(null);
    } finally {
      setLoadingResult(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Results</h1>
          <p>Generate a result card for a student and exam</p>
        </div>
      </div>

      <ApiError error={error2} onClose={() => setError2(null)} />

      <div className="card">
        <div className="card-body">
          <div className="form-grid">
            <Field label="Student" required>
              <select className="select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">— Select student —</option>
                {(students?.students || []).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.userId?.name || s.name} · {s.admissionNumber}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Exam" required>
              <select className="select" value={examId} onChange={(e) => setExamId(e.target.value)}>
                <option value="">— Select exam —</option>
                {exams.length === 0 && <option value="">(create an exam first)</option>}
                {exams.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name} ({x.academicYear})
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={loadResult}
              disabled={!studentId || !examId || loadingResult}
            >
              {loadingResult ? 'Generating…' : 'Generate Result'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3>Result Card</h3>
              <Badge color={result.summary.result === 'PASS' ? 'green' : 'red'}>{result.summary.result}</Badge>
            </div>
            <div className="card-body">
              <div className="grid-2">
                <div>
                  <div className="text-muted" style={{ fontSize: 12 }}>STUDENT</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{result.student.name}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{result.student.email}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>
                    {result.student.class ? classLabel(result.student.class) : '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted" style={{ fontSize: 12 }}>EXAM</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{result.exam.name}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{result.exam.academicYear}</div>
                </div>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th style={{ textAlign: 'right' }}>Marks</th>
                    <th style={{ textAlign: 'right' }}>Max</th>
                    <th style={{ textAlign: 'right' }}>Percentage</th>
                    <th style={{ textAlign: 'right' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result.subjects.map((sub, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{sub.subject.name}</td>
                      <td>{sub.subject.code || '—'}</td>
                      <td className="text-right">{sub.marksObtained}</td>
                      <td className="text-right">{sub.maxMarks}</td>
                      <td className="text-right">{sub.percentage}%</td>
                      <td className="text-right">
                        <Badge color={sub.result === 'PASS' ? 'green' : 'red'}>{sub.result}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-body">
              <ul className="list-plain">
                <li>
                  <span className="lp-label">Total</span>
                  <span className="lp-value">
                    {result.summary.obtainedMarks} / {result.summary.totalMarks}
                  </span>
                </li>
                <li>
                  <span className="lp-label">Overall percentage</span>
                  <span className="lp-value">{result.summary.percentage}%</span>
                </li>
                <li>
                  <span className="lp-label">Overall result</span>
                  <span className="lp-value">
                    <Badge color={result.summary.result === 'PASS' ? 'green' : 'red'}>
                      {result.summary.result}
                    </Badge>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!result && !loadingResult && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-body">
            <EmptyState
              icon="🏅"
              title="Select a student and exam"
              message="Your generated result card will appear here."
            />
          </div>
        </div>
      )}
    </div>
  );
}
