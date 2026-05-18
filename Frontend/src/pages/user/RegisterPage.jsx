import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../api/authApi';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const parts = form.fullName.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      const username = form.fullName.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);

      const response = await authApi.register({
        username,
        email: form.email,
        password: form.password,
        firstName,
        lastName
      });

      login({
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
        accessToken: response.data.accessToken
      });
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left panel */}
      <div className="register-left">
        <div className="register-left-bg" />
        <div className="register-brand">
          <h1>AuraSocial</h1>
          <p>Step into a highly curated, immersive social experience designed for the modern native.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="register-right">
        <div className="register-form-container animate-fade-in">
          <div className="register-form-card card">
            <h2>Create Account</h2>
            <p className="register-subtitle">Join the premium social experience.</p>

            <form onSubmit={handleSubmit} className="register-form">
              <input
                id="fullname-input"
                type="text"
                name="fullName"
                className="input-field"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
              />
              <input
                id="register-email-input"
                type="email"
                name="email"
                className="input-field"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                id="register-password-input"
                type="password"
                name="password"
                className="input-field"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <input
                id="confirm-password-input"
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

              {error && <p className="form-error" style={{ color: '#ff4d4f', fontSize: '0.875rem' }}>{error}</p>}

              <button
                id="create-account-btn"
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={16} />
              </button>

              <div className="register-divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <button type="button" className="btn btn-secondary btn-full" id="register-google-btn">
                <span className="social-icon-g">G</span>
                Sign up with Google
              </button>
              <button type="button" className="btn btn-secondary btn-full" id="register-apple-btn">
                <span className="social-icon-apple">iOS</span>
                Sign up with Apple
              </button>

              <p className="register-footer">
                Already have an account?{' '}
                <button type="button" className="text-link" onClick={() => navigate('/login')}>
                  Log in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
