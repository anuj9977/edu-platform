import { useFetch } from '../../hooks/useFetch';
import { Badge, EmptyState, PageLoader } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/format';

const statusColor = {
  paid: 'green',
  partial: 'amber',
  pending: 'amber',
  overdue: 'red',
};

export default function ParentFees() {
  const { data, loading, error } = useFetch('/api/fees/parent');

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <EmptyState icon="⚠️" title="Could not load fees" message={error.message} />
        </div>
      </div>
    );
  }

  const children = data?.children || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Children Fees</h1>
          <p>Fee invoices for your children</p>
        </div>
      </div>

      {children.length === 0 && (
        <div className="card">
          <div className="card-body">
            <EmptyState icon="💰" title="No children linked" message="No children are linked to this parent account yet." />
          </div>
        </div>
      )}

      {children.map((child) => (
        <div className="card" key={child.student.id} style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h3>{child.student.name}</h3>
            <div className="flex gap-sm">
              <span className="badge badge-blue">{child.student.class ? `${child.student.class.name}${child.student.class.section ? '-' + child.student.class.section : ''}` : 'No class'}</span>
            </div>
          </div>
          <div className="card-body">
            <div className="stats-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-label">Total</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{formatCurrency(child.summary.totalAmount)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Paid</div>
                <div className="stat-value" style={{ fontSize: 20, color: 'var(--green)' }}>{formatCurrency(child.summary.paidAmount)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending</div>
                <div className="stat-value" style={{ fontSize: 20, color: 'var(--red)' }}>{formatCurrency(child.summary.pendingAmount)}</div>
              </div>
            </div>
            {child.invoices.length === 0 ? (
              <EmptyState icon="🧾" title="No invoices yet" />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ textAlign: 'right' }}>Paid</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {child.invoices.map((inv) => (
                      <tr key={inv._id}>
                        <td>{inv.feeStructureId?.name || '—'}</td>
                        <td className="text-right">{formatCurrency(inv.totalAmount)}</td>
                        <td className="text-right">{formatCurrency(inv.paidAmount)}</td>
                        <td>{formatDate(inv.dueDate)}</td>
                        <td><Badge color={statusColor[inv.status] || 'gray'}>{inv.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}