import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = state.users.find(
        u => u.email === email && u.password === password
      );

      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        navigate('/');
      } else {
        setError('Invalid email or password. Try garv@example.com / password123');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-gradient g1" />
      <div className="auth-bg-gradient g2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📚</div>
          <h1>ScholorFlow</h1>
        </div>

        <h2 className="auth-title">Welcome back!</h2>
        <p className="auth-subtitle">Sign in to continue to your dashboard</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label className="input-label">Email Address</label>
            <input
              id="login-email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="input-label">Password</label>
            <input
              id="login-password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div
          style={{
            background: 'rgba(0, 180, 216, 0.06)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          <strong style={{ color: 'var(--accent-secondary)' }}>Demo Account:</strong>{' '}
          garv@example.com / password123
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
