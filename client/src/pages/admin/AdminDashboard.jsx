import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { EmptyState, PageLoader, StatCard } from '../../components/ui';
import { formatCurrency } from '../../utils/format';

function ClassChart({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="text-muted">No students assigned to classes yet.</p>;
  }
  const max = Math.max(...rows.map((r) => r.studentCount || 0), 1);
  return (
    <div className="chart-row">
      {rows.map((r) => (
        <div className="chart-col" key={`${r._id || r.className}${r.section || ''}`} title={r.className}>
          <div className="chart-value">{r.studentCount}</div>
          <div className="chart-bar" style={{ height: `${Math.max((r.studentCount / max) * 120, 6)}px` }} />
          <div className="chart-label">
            {r.className}
            {r.section ? `-${r.section}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading, error } = useFetch('/api/dashboard/admin/analytics');
  const navigate = useNavigate();

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <EmptyState icon="⚠️" title="Could not load analytics" message={error.message} />
        </div>
      </div>
    );
  }

  const d = data?.data;
  if (!d) return <EmptyState title="No analytics data" message="Add students, marks and fees to see insights." />;

  const students = d.studentAnalytics;
  const attendance = d.attendanceAnalytics;
  const fees = d.feeAnalytics;
  const results = d.resultAnalytics;

  const attendancePct = attendance?.attendancePercentage ?? 0;
  const collectionPct = fees?.collectionPercentage ?? 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Institution overview • live analytics</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Active Students"
          value={students?.totalActiveStudents ?? 0}
          icon="🎓"
          bg="var(--primary-50)"
          hint={`${students?.classWiseStudents?.length ?? 0} classes configured`}
        />
        <StatCard
          label="Attendance"
          value={attendancePct}
          suffix="%"
          icon="✅"
          bg="var(--green-bg)"
          hint={`${attendance?.total ?? 0} total records`}
        />
        <StatCard
          label="Fee Collection"
          value={collectionPct}
          suffix="%"
          icon="💰"
          bg="var(--amber-bg)"
          hint={`${formatCurrency(fees?.pendingAmount ?? 0)} pending`}
        />
        <StatCard
          label="Avg. Marks"
          value={results?.averageMarks ?? 0}
          icon="🏅"
          bg="var(--blue-bg)"
          hint={`${results?.totalResults ?? 0} results recorded`}
        />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div className="card-header">
            <h3>Students per class</h3>
          </div>
          <div className="card-body">
            <ClassChart rows={students?.classWiseStudents || []} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Attendance split</h3>
          </div>
          <div className="card-body">
            <ul className="list-plain">
              <li>
                <span className="lp-label">Present</span>
                <span className="lp-value text-success">{attendance?.present ?? 0}</span>
              </li>
              <li>
                <span className="lp-label">Late</span>
                <span className="lp-value text-muted">{attendance?.late ?? 0}</span>
              </li>
              <li>
                <span className="lp-label">Excused</span>
                <span className="lp-value text-muted">{attendance?.excused ?? 0}</span>
              </li>
              <li>
                <span className="lp-label">Absent</span>
                <span className="lp-value text-danger">{attendance?.absent ?? 0}</span>
              </li>
            </ul>
            <div className="mt-2">
              <div className="progressbar">
                <div style={{ width: `${Math.min(attendancePct, 100)}%` }} />
              </div>
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                {attendancePct}% attendance rate
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Fee summary</h3>
          </div>
          <div className="card-body">
            <ul className="list-plain">
              <li>
                <span className="lp-label">Total invoiced</span>
                <span className="lp-value">{formatCurrency(fees?.totalAmount ?? 0)}</span>
              </li>
              <li>
                <span className="lp-label">Collected</span>
                <span className="lp-value text-success">{formatCurrency(fees?.paidAmount ?? 0)}</span>
              </li>
              <li>
                <span className="lp-label">Pending</span>
                <span className="lp-value text-danger">{formatCurrency(fees?.pendingAmount ?? 0)}</span>
              </li>
              <li>
                <span className="lp-label">Overdue invoices</span>
                <span className="lp-value">{fees?.overdueInvoices ?? 0}</span>
              </li>
            </ul>
            <button type="button" className="btn btn-sm" onClick={() => navigate('/admin/fees')} style={{ marginTop: 12 }}>
              Manage fees →
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Result overview</h3>
          </div>
          <div className="card-body">
            <ul className="list-plain">
              <li>
                <span className="lp-label">Total marks obtained</span>
                <span className="lp-value">
                  {results?.totalMarks ?? 0} / {results?.totalMaxMarks ?? 0}
                </span>
              </li>
              <li>
                <span className="lp-label">Average per subject</span>
                <span className="lp-value">{results?.averageMarks ?? 0}</span>
              </li>
              <li>
                <span className="lp-label">Overall percentage</span>
                <span className="lp-value">{results?.overallPercentage ?? 0}%</span>
              </li>
            </ul>
            <button type="button" className="btn btn-sm" onClick={() => navigate('/admin/results')} style={{ marginTop: 12 }}>
              View results →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}