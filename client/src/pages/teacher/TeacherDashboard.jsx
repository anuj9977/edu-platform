import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { EmptyState, PageLoader, StatCard } from '../../components/ui';
import { classLabel } from '../../utils/format';

export default function TeacherDashboard() {
  const { data, loading, error } = useFetch('/api/dashboard/teacher');
  const navigate = useNavigate();

  if (loading) return <PageLoader />;
  if (error || !data) {
    return (
      <div className="card">
        <div className="card-body">
          <EmptyState icon="⚠️" title="Could not load dashboard" message={error?.message} />
        </div>
      </div>
    );
  }

  const teacher = data.teacher;
  const assignments = data.assignments || [];
  const subjects = assignments.map((a) => a.subject?.name).filter(Boolean);
  const classes = assignments.map((a) => a.class).filter(Boolean);
  const uniqueClasses = classes.filter((c, i, arr) => arr.findIndex((x) => x?._id === c?._id) === i);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {teacher.name}</h1>
          <p>{uniqueClasses.length} class(es) • {subjects.length} subject(s) assigned</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="My Classes" value={uniqueClasses.length} icon="🏛️" bg="var(--primary-50)" />
        <StatCard label="Subjects" value={subjects.length} icon="📚" bg="var(--blue-bg)" />
        <StatCard label="Assignments" value={assignments.length} icon="🧩" bg="var(--green-bg)" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>My assignments</h3>
          <div className="flex gap-sm">
            <button type="button" className="btn btn-sm" onClick={() => navigate('/teacher/attendance')}>✅ Attendance</button>
            <button type="button" className="btn btn-sm" onClick={() => navigate('/teacher/marks')}>✏️ Marks</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <EmptyState icon="🧩" title="No assignments yet" message="Ask your admin to assign subjects to you." />
                  </td>
                </tr>
              )}
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{classLabel(a.class)}</td>
                  <td>{a.subject?.name}</td>
                  <td>{a.subject?.code || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}