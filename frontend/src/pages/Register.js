// src/pages/Register.js — REPLACE

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 2)     return 'Name must be at least 2 characters';
    if (!form.email.includes('@'))        return 'Enter a valid email address';
    if (form.password.length < 8)         return 'Password must be at least 8 characters';
    if (form.password !== form.confirm)   return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/login', { state: { message: 'Account created! Please login.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🛍️</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Join us today — it's free!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrap">
              <FiUser size={15} className="input-icon" />
              <input type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Ahmed Khan"
                className="form-input input-padded" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <FiMail size={15} className="input-icon" />
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                className="form-input input-padded" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <FiLock size={15} className="input-icon" />
              <input
                type={showPwd ? 'text' : 'password'}
                name="password" value={form.password}
                onChange={handleChange} placeholder="Min 8 characters"
                className="form-input input-padded input-padded-right" required />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrap">
              <FiLock size={15} className="input-icon" />
              <input
                type={showPwd ? 'text' : 'password'}
                name="confirm" value={form.confirm}
                onChange={handleChange} placeholder="Repeat your password"
                className={`form-input input-padded ${form.confirm && form.confirm !== form.password ? 'err' : ''}`}
                required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <Spinner /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;