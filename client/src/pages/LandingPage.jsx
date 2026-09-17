import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    role: 'admin',
    icon: '🛡️',
    tint: '#4f46e5',
    title: 'Admin',
    desc: 'Run the whole institution — students, staff, exams, fees and announcements from a single dashboard.',
    features: ['Full institutional control', 'Analytics & reports', 'Fee & attendance oversight'],
  },
  {
    role: 'teacher',
    icon: '👩‍🏫',
    tint: '#059669',
    title: 'Teacher',
    desc: 'Manage your classes — take attendance, enter marks and stay updated with announcements.',
    features: ['My classes in one place', 'Quick attendance', 'Marks entry'],
  },
  {
    role: 'student',
    icon: '🎓',
    tint: '#2563eb',
    title: 'Student',
    desc: 'Track your subjects, attendance and everything your school shares with you.',
    features: ['Subject & teacher list', 'Attendance status', 'School announcements'],
  },
  {
    role: 'parent',
    icon: '👨‍👩‍👧',
    tint: '#d97706',
    title: 'Parent',
    desc: 'Stay close to your child\'s education — fees, classes and announcements at a glance.',
    features: ['Children profiles', 'Fee invoices', 'Announcements'],
  },
];

const FEATURES = [
  { icon: '🧑‍🏫', title: 'Staff management', desc: 'Add teachers with qualifications, specializations and subject assignments.' },
  { icon: '🎓', title: 'Student records', desc: 'Admissions, roll numbers, classes, parents and full profiles.' },
  { icon: '📝', title: 'Exams & results', desc: 'Create exams, configure subjects, enter marks and generate result cards.' },
  { icon: '✅', title: 'Attendance', desc: 'One-tap sessions per class-subject with live summary and analytics.' },
  { icon: '💰', title: 'Fees & payments', desc: 'Fee structures, invoices and payment tracking with collection insights.' },
  { icon: '📣', title: 'Announcements', desc: 'Target the whole school, a class, or a single student with instant notifications.' },
];

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const goTo = (path) => navigate(path);
  const goToLogin = (role) => navigate(`/login?role=${role}`);

  return (
    <div className="landing">
      {/* Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <span className="landing-logo">🎓</span>
            <span>EduPlatform</span>
          </div>
          <nav className="landing-links">
            <a href="#roles">Login</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </nav>
          <div className="landing-nav-actions">
            {user ? (
              <>
                <span className="landing-role-chip">
                  {user.name} · <strong>{user.role}</strong>
                </span>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => goTo(`/${user.role}`)}>
                  Go to dashboard →
                </button>
                <button type="button" className="btn btn-sm" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-sm" onClick={() => goTo('/register')}>
                  Register institution
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => goTo('/login')}>
                  ← Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-badge">🎒 One platform for your whole institution</div>
          <h1>
            Manage your <span className="landing-gradient">school, college</span>
            <br /> …from one beautiful dashboard.
          </h1>
          <p className="landing-sub">
            EduPlatform brings students, teachers, parents, exams, attendance, fees and announcements
            together — with role-based access for everyone.
          </p>
          <div className="landing-hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => goTo('/register')}>
              Get started free →
            </button>
            <button type="button" className="btn" onClick={() => goTo('/login')}>
              I already have an account
            </button>
          </div>
          <div className="landing-stats">
            <div><strong>4</strong> roles</div>
            <div><strong>13+</strong> admin modules</div>
            <div><strong>100%</strong> role-based</div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="roles">
        <div className="landing-section-header">
          <h2>Login as your role</h2>
          <p>Pick the account type below — each role opens a tailored workspace.</p>
        </div>
        <div className="landing-roles">
          {ROLES.map((r) => (
            <div className="landing-role-card" key={r.role}>
              <div className="landing-role-icon" style={{ background: `${r.tint}1a`, color: r.tint }}>
                {r.icon}
              </div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
              <ul className="landing-role-features">
                {r.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button type="button" className="btn" style={{ color: r.tint, borderColor: r.tint }} onClick={() => goToLogin(r.role)}>
                Login as {r.title}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-alt" id="features">
        <div className="landing-section-header">
          <h2>Everything you need to run an institution</h2>
          <p>Purpose-built modules that talk to each other.</p>
        </div>
        <div className="landing-features">
          {FEATURES.map((f) => (
            <div className="landing-feature" key={f.title}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="about">
        <div className="landing-cta">
          <h2>Ready to bring your institution online?</h2>
          <p>Register your school, college, coaching center or institute in under a minute.</p>
          <div className="landing-hero-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={() => goTo('/register')}>
              Create your institution →
            </button>
            <button type="button" className="btn" onClick={() => goToLogin('admin')}>
              Login as Admin
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <strong>🎓 EduPlatform</strong>
        </div>
        <div>
          Built for admins, teachers, students & parents — <Link to="/register">Register</Link> ·{' '}
          <Link to="/login">Login</Link>
        </div>
      </footer>
    </div>
  );
}
