import { useFetch } from '../../hooks/useFetch';
import { EmptyState, PageLoader, StatCard } from '../../components/ui';

export default function StudentDashboard() {
  const { data, loading, error } = useFetch('/api/dashboard/student');

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

  const { student, subjects, attendance } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hi, {student.name} 👋</h1>
          <p>
            {student.class?.name || 'Class'} {student.class?.section || ''} • {student.class?.academicYear || ''}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Subjects" value={subjects?.length ?? 0} icon="📚" bg="var(--primary-50)" />
        <StatCard
          label="Attendance"
          value={attendance?.percentage ?? 0}
          suffix="%"
          icon="✅"
          bg="var(--green-bg)"
          hint={`${attendance?.present ?? 0} of ${attendance?.totalClasses ?? 0} classes present`}
        />
        <StatCard label="Absent" value={attendance?.absent ?? 0} icon="❌" bg="var(--red-bg)" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>My subjects & teachers</h3></div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {subjects?.length === 0 && (
                  <tr>
                    <td colSpan={3}><EmptyState icon="📚" title="No subjects assigned yet" /></td>
                  </tr>
                )}
                {subjects?.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.code || '—'}</td>
                    <td>{s.teacher || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Attendance overview</h3></div>
          <div className="card-body">
            <ul className="list-plain">
              <li><span className="lp-label">Total classes</span><span className="lp-value">{attendance?.totalClasses ?? 0}</span></li>
              <li><span className="lp-label">Present</span><span className="lp-value text-success">{attendance?.present ?? 0}</span></li>
              <li><span className="lp-label">Absent</span><span className="lp-value text-danger">{attendance?.absent ?? 0}</span></li>
              <li><span className="lp-label">Late</span><span className="lp-value text-muted">{attendance?.late ?? 0}</span></li>
            </ul>
            <div className="mt-2">
              <div className="progressbar">
                <div style={{ width: `${Math.min(attendance?.percentage ?? 0, 100)}%` }} />
              </div>
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                {attendance?.percentage ?? 0}% attendance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}