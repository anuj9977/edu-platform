import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Field } from '../components/ui';

const ROLES = [
  { role: 'admin', icon: '🛡️', label: 'Admin' },
  { role: 'teacher', icon: '👩‍🏫', label: 'Teacher' },
  { role: 'student', icon: '🎓', label: 'Student' },
  { role: 'parent', icon: '👨‍👩‍👧', label: 'Parent' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedRole = searchParams.get('role') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickRole = (role) => {
    setError(null);
    if (role === selectedRole) setSearchParams({});
    else setSearchParams({ role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (selectedRole && user.role !== selectedRole) {
        setError(
          new Error(
            `This account is registered as a ${user.role}, not a ${selectedRole}. Please use the ${user.role} login instead.`
          )
        );
        setLoading(false);
        return;
      }
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const current = ROLES.find((r) => r.role === selectedRole);

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="card-body">
          <button
            type="button"
            className="btn btn-sm"
            style={{ position: 'absolute', top: 14, left: 14 }}
            onClick={() => navigate('/')}
          >
            ← Home
          </button>
          <div className="auth-logo">🎓</div>
          <h2>{current ? `${current.icon} ${current.label} Login` : 'Welcome back'}</h2>
          <p className="auth-sub">Select your role, then sign in to continue</p>

          {/* Role selector */}
          <div className="login-roles">
            {ROLES.map((r) => {
              const active = r.role === selectedRole;
              return (
                <button
                  key={r.role}
                  type="button"
                  className={`login-role ${active ? 'active' : ''}`}
                  onClick={() => pickRole(r.role)}
                  aria-pressed={active}
                >
                  <span className="login-role-ico">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {selectedRole && !current && <Alert type="info">Unknown role selected — signing in without a role filter.</Alert>}

          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Email" required>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </Field>
            <Field label="Password" required>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in…' : current ? `Sign in as ${current.label}` : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            New institution? <Link to="/register">Register your school / college</Link>
          </div>
        </div>
      </div>
    </div>
  );
}