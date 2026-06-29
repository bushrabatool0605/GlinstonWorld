import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,   setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🛍️</div>
          <h1 className="login-title">Admin Panel</h1>
          <p className="login-sub">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <FiMail className="input-icon" size={15} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourstore.com"
                className="form-input"
                style={{ paddingLeft: 38 }}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <FiLock className="input-icon" size={15} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                style={{ paddingLeft: 38, paddingRight: 42 }}
                required
              />
              <button
                type="button"
                className="toggle-pwd"
                onClick={() => setShowPwd(v => !v)}
              >
                {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <Spinner /> : 'Sign In'}
          </button>
        </form>

        <p className="login-note">
          Only administrators can access this panel.
        </p>
      </div>
    </div>
  );
};

export default Login;
