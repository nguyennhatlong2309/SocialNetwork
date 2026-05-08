import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authApi from '../api/authApi';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.login({ usernameOrEmail, password });
      // Store user and token
      login({
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        accessToken: response.data.accessToken
      });
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-bg-glow-2" />

      <div className="login-container animate-fade-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Activity size={20} color="white" />
          </div>
          <div>
            <h1>AuraSocial</h1>
            <p>Welcome back to the premium social experience.</p>
          </div>
        </div>

        {/* Form */}
        <div className="login-form-card card">
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email/Username */}
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="email-input"
                  type="text"
                  className="input-field input-with-icon-field"
                  placeholder="hello@aurasocial.com or username"
                  value={usernameOrEmail}
                  onChange={e => setUsernameOrEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <button type="button" className="forgot-btn">Forgot Password?</button>
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field input-with-icon-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  id="toggle-password-btn"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              id="sign-in-btn"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span>OR</span>
            </div>

            {/* Social Login */}
            <div className="social-buttons">
              <button type="button" className="btn btn-secondary" id="google-btn">
                <span className="social-icon google-icon">G</span>
                Google
              </button>
              <button type="button" className="btn btn-secondary" id="apple-btn">
                <span className="social-icon">iOS</span>
                Apple
              </button>
            </div>
          </form>
        </div>

        <p className="login-footer">
          Don't have an account?{' '}
          <button className="text-link" onClick={() => navigate('/register')}>
            Register now
          </button>
        </p>
      </div>
    </div>
  );
}
