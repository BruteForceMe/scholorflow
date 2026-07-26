import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function SignupPage() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      dispatch({ type: 'SIGNUP', payload: { name, email, password } });
      navigate('/');
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

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start managing your academic life smarter</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="auth-field">
            <label className="input-label">Full Name</label>
            <input
              id="signup-name"
              className="input-field"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="input-label">Email Address</label>
            <input
              id="signup-email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="input-label">Password</label>
            <input
              id="signup-password"
              className="input-field"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="input-label">Confirm Password</label>
            <input
              id="signup-confirm-password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <FiArrowRight />}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
