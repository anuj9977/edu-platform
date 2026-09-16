import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui';
import { formatDateTime } from '../utils/format';

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/students', label: 'Students', icon: '🎓', end: false },
  { to: '/admin/teachers', label: 'Teachers', icon: '👩‍🏫', end: false },
  { to: '/admin/parents', label: 'Parents', icon: '👨‍👩‍👧', end: false },
  { to: '/admin/classes', label: 'Classes', icon: '🏛️', end: false },
  { to: '/admin/subjects', label: 'Subjects', icon: '📚', end: false },
  { to: '/admin/assignments', label: 'Assignments', icon: '🧩', end: false },
  { to: '/admin/exams', label: 'Exams', icon: '📝', end: false },
  { to: '/admin/marks', label: 'Marks Entry', icon: '✏️', end: false },
  { to: '/admin/results', label: 'Results', icon: '🏅', end: false },
  { to: '/admin/attendance', label: 'Attendance', icon: '✅', end: false },
  { to: '/admin/fees', label: 'Fees', icon: '💰', end: false },
  { to: '/admin/announcements', label: 'Announcements', icon: '📣', end: false },
];

const TEACHER_NAV = [
  { to: '/teacher', label: 'Dashboard', icon: '📊', end: true },
  { to: '/teacher/attendance', label: 'My Attendance', icon: '✅', end: false },
  { to: '/teacher/marks', label: 'My Marks', icon: '✏️', end: false },
  { to: '/teacher/announcements', label: 'Announcements', icon: '📣', end: false },
];

const STUDENT_NAV = [
  { to: '/student', label: 'Dashboard', icon: '📊', end: true },
  { to: '/student/announcements', label: 'Announcements', icon: '📣', end: false },
];

const PARENT_NAV = [
  { to: '/parent', label: 'Dashboard', icon: '📊', end: true },
  { to: '/parent/fees', label: 'Children Fees', icon: '💰', end: false },
  { to: '/parent/announcements', label: 'Announcements', icon: '📣', end: false },
];

const NAVS = {
  admin: ADMIN_NAV,
  teacher: TEACHER_NAV,
  student: STUDENT_NAV,
  parent: PARENT_NAV,
};

function NotificationsBell({ onNavigate }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const unread = notifs.filter((n) => !n.isRead).length;

  const load = () => {
    api
      .get('/api/notifications')
      .then((d) => setNotifs(d.notifications || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 45000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="dropdown-wrap" ref={ref}>
      <button type="button" className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        🔔
        {unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="dropdown-menu notif-menu">
          <div className="dropdown-header">
            <span>Notifications</span>
            <button type="button" className="btn btn-sm" onClick={() => { setOpen(false); onNavigate('/notifications'); }}>
              View all
            </button>
          </div>
          <div className="notif-list">
            {notifs.length === 0 && (
              <div className="empty-state" style={{ padding: '24px 12px' }}>
                <div className="empty-icon">🔕</div>
                <p style={{ margin: 0 }}>No notifications yet</p>
              </div>
            )}
            {notifs.slice(0, 8).map((n) => (
              <button
                key={n._id}
                type="button"
                className={`notif-item ${n.isRead ? '' : 'unread'}`}
                onClick={() => {
                  if (!n.isRead) markRead(n._id);
                  navigate('/notifications');
                  setOpen(false);
                }}
              >
                <div className="n-title">
                  <span>{n.type === 'holiday' ? '🏖️' : n.type === 'exam' ? '📝' : n.type === 'fee' ? '💰' : '📢'}</span>
                  {n.title}
                </div>
                <div className="n-msg">{n.message}</div>
                <div className="n-time">{formatDateTime(n.createdAt)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ role, onNavigate }) {
  const nav = NAVS[role] || [];
  return (
    <>
      <div className="sidebar-brand">
        <span className="logo">🎓</span>
        <span>EduPlatform</span>
      </div>
      <nav className="sidebar-nav">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <span className="nav-ico">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const role = user.role;

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent role={role} onNavigate={() => setSidebarOpen(false)} />
        <div className="sidebar-footer">
          <button
            type="button"
            className="btn btn-block"
            style={{ background: 'rgba(79,70,229,0.25)', borderColor: 'transparent', color: '#fff' }}
            onClick={() => navigate('/register')}
          >
            ➕ Register Institution
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button type="button" className="icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <div className="topbar-title">EduPlatform</div>
          <div className="topbar-spacer" />
          <NotificationsBell onNavigate={(path) => navigate(path)} />
          <div className="dropdown-wrap" ref={userMenuRef}>
            <button type="button" className="user-chip" onClick={() => setUserMenuOpen((o) => !o)}>
              <Avatar name={user.name} />
              <div style={{ textAlign: 'left' }}>
                <div className="uc-name">{user.name}</div>
                <div className="uc-role">{role}</div>
              </div>
              <span className="text-muted" style={{ fontSize: 11 }}>▾</span>
            </button>
            {userMenuOpen && (
              <div className="dropdown-menu">
                <button type="button" className="dropdown-item" onClick={() => navigate('/notifications')}>
                  🔔 Notifications
                </button>
                <button type="button" className="dropdown-item danger" onClick={doLogout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
