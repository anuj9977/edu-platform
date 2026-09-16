import { useFetch } from '../../hooks/useFetch';
import { EmptyState, PageLoader, StatCard, Avatar } from '../../components/ui';
import { classLabel } from '../../utils/format';

export default function ParentDashboard() {
  const { data, loading, error } = useFetch('/api/dashboard/parent');

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

  const children = data.children || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {data.parent?.name}</h1>
          <p>Manage your children's academic life</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Children" value={children.length} icon="👨‍👩‍👧" bg="var(--primary-50)" />
      </div>

      {children.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState icon="👶" title="No children linked" message="Ask your institution to link your children to this account." />
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {children.map((child) => (
            <div className="card" key={child.id}>
              <div className="card-body">
                <div className="flex">
                  <Avatar name={child.name} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{child.name}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>{child.email}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="badge badge-violet">
                    {child.class ? classLabel(child.class) : 'Class not assigned'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}