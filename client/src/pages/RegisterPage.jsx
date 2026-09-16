import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Field } from '../components/ui';

const INSTITUTION_TYPES = ['school', 'college', 'coaching', 'institute'];

const initialForm = {
  institutionName: '',
  institutionType: 'school',
  institutionEmail: '',
  institutionPhone: '',
  institutionAddress: '',
  adminName: '',
  adminEmail: '',
  password: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await register(form);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <div className="auth-logo">🏫</div>
          <h2>Register your institution</h2>
          <p className="auth-sub">Create the admin account for your school, college or institute</p>

          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <h4 style={{ margin: '4px 0 12px' }}>Institution details</h4>
            <div className="form-grid">
              <Field label="Institution Name" required>
                <input className="input" value={form.institutionName} onChange={set('institutionName')} required />
              </Field>
              <Field label="Type" required>
                <select className="select" value={form.institutionType} onChange={set('institutionType')}>
                  {INSTITUTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Institution Email" required>
                <input type="email" className="input" value={form.institutionEmail} onChange={set('institutionEmail')} required />
              </Field>
              <Field label="Phone" required>
                <input className="input" value={form.institutionPhone} onChange={set('institutionPhone')} required />
              </Field>
              <Field label="Address" span2>
                <input className="input" value={form.institutionAddress} onChange={set('institutionAddress')} />
              </Field>
            </div>

            <h4 style={{ margin: '18px 0 12px' }}>Admin account</h4>
            <div className="form-grid">
              <Field label="Admin Name" required>
                <input className="input" value={form.adminName} onChange={set('adminName')} required />
              </Field>
              <Field label="Admin Email" required>
                <input type="email" className="input" value={form.adminEmail} onChange={set('adminEmail')} required />
              </Field>
              <Field label="Password (min 6 chars)" required>
                <input
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={set('password')}
                  minLength={6}
                  required
                />
              </Field>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating…' : 'Create Institution & Admin'}
            </button>
          </form>

          <div className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}