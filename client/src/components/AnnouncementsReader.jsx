import { useFetch } from '../hooks/useFetch';
import { Badge, EmptyState, PageLoader } from './ui';
import { formatDateTime } from '../utils/format';

const typeEmoji = {
  general: '📢',
  academic: '📚',
  exam: '📝',
  fee: '💰',
  event: '🎉',
  holiday: '🏖️',
  emergency: '🚨',
};

const typeColor = {
  general: 'gray',
  academic: 'blue',
  exam: 'violet',
  fee: 'amber',
  event: 'green',
  holiday: 'amber',
  emergency: 'red',
};

export default function AnnouncementsReader({ fetchPath, title = 'Announcements' }) {
  const { data, loading, error } = useFetch(fetchPath);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <EmptyState icon="⚠️" title="Could not load announcements" message={error.message} />
        </div>
      </div>
    );
  }

  const announcements = data?.announcements || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{announcements.length} published update(s)</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState icon="📣" title="No announcements yet" message="Check back later for updates from your institution." />
          </div>
        </div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: '1fr' }}>
          {announcements.map((a) => (
            <div className="card" key={a._id}>
              <div className="card-body">
                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 17 }}>{typeEmoji[a.type] || '📢'}</div>
                  <Badge color={typeColor[a.type] || 'gray'}>{a.type}</Badge>
                </div>
                <h3 style={{ marginTop: 10 }}>{a.title}</h3>
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{a.message}</p>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Posted by <strong>{a.createdBy?.name || 'Admin'}</strong> • {formatDateTime(a.publishedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}