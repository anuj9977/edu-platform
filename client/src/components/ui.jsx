// Shared presentational components used across pages
import { initials } from '../utils/format';

export function Spinner() {
  return (
    <div className="loader-box">
      <div className="spinner" />
    </div>
  );
}

export function PageLoader() {
  return <Spinner />;
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

const badgeColors = {
  green: 'badge-green',
  red: 'badge-red',
  amber: 'badge-amber',
  blue: 'badge-blue',
  gray: 'badge-gray',
  violet: 'badge-violet',
};

export function Badge({ color = 'gray', children }) {
  return <span className={`badge ${badgeColors[color] || badgeColors.gray}`}>{children}</span>;
}

export function statusBadge(status = '') {
  const s = String(status || '').toLowerCase();
  if (['active', 'paid', 'pass', 'present', 'true', 'completed', 'success'].includes(s)) {
    return <Badge color="green">{status}</Badge>;
  }
  if (['inactive', 'unpaid', 'fail', 'absent', 'overdue', 'false', 'not_appeared'].includes(s)) {
    return <Badge color="red">{status.replace(/_/g, ' ')}</Badge>;
  }
  if (['pending', 'partial', 'upcoming', 'late', 'ongoing'].includes(s)) {
    return <Badge color="amber">{status.replace(/_/g, ' ')}</Badge>;
  }
  if (['excused', 'graduated', 'not_appeared'].includes(s)) {
    return <Badge color="blue">{status.replace(/_/g, ' ')}</Badge>;
  }
  return <Badge color="gray">{status.replace(/_/g, ' ')}</Badge>;
}

export function StatCard({ label, value, icon = '📊', bg = 'var(--primary-50)', hint, suffix }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        {icon}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {suffix && <span style={{ fontSize: 15, color: 'var(--muted)', marginLeft: 4 }}>{suffix}</span>}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Alert({ type = 'info', children, onClose }) {
  return (
    <div className={`alert alert-${type}`}>
      <span>{children}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="flex-wrap gap-sm">{actions}</div>}
    </div>
  );
}

// Avatar with initials
export function Avatar({ name }) {
  return <span className="avatar">{initials(name)}</span>;
}

export function NameCell({ name, sub }) {
  return (
    <div className="name-cell">
      <Avatar name={name} />
      <div>
        <div className="nm">{name}</div>
        {sub && <div className="em">{sub}</div>}
      </div>
    </div>
  );
}

export function Field({ label, required, children, className = '', span2 }) {
  return (
    <div className={`field ${span2 ? 'field-span-2' : ''} ${className}`}>
      <label>
        {label}
        {required ? <span className="req"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

// Reusable error banner wrapper
export function ApiError({ error, onClose }) {
  if (!error) return null;
  return (
    <Alert type="error" onClose={onClose}>
      {error.message || 'Something went wrong'}
    </Alert>
  );
}