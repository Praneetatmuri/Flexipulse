import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiService';
import { getApiErrorMessage } from '../services/apiService';

const roleOptions = [
  { value: 'MEMBER', title: 'Member', caption: 'Track progress and book sessions' },
  { value: 'TRAINER', title: 'Trainer', caption: 'Manage clients and gym plans' },
];

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('MEMBER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const emailError = email && !/^\S+@\S+\.\S+$/.test(email)
    ? 'Enter a valid email address.'
    : '';
  const passwordError = mode === 'register' && password && password.length < 8
    ? 'Password must be at least 8 characters.'
    : '';

  const submitLabel = mode === 'login' ? 'Login' : `Register ${role.toLowerCase()}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setMessage('Name is required for registration.');
          setLoading(false);
          return;
        }

        if (emailError || passwordError) {
          setMessage(emailError || passwordError);
          setLoading(false);
          return;
        }

        await authApi.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });

        setMode('login');
        setPassword('');
        setMessage('Registration successful. Please login to continue.');
        toast.success('Account created. Please login now.');
        return;
      }

      if (emailError) {
        setMessage(emailError);
        setLoading(false);
        return;
      }

      const response = await authApi.login(email.trim(), password);
      const authPayload = response.data;
      const user = authPayload.user;
      const returnedRole = (user.role || 'MEMBER').toUpperCase();

      if (returnedRole !== role) {
        setMessage(`This account is ${returnedRole}. Please choose the correct portal.`);
        setLoading(false);
        return;
      }

      toast.success(`Welcome ${user.name || 'back'}!`);
      onAuthSuccess(authPayload);
    } catch (error) {
      const friendly = getApiErrorMessage(error, 'Authentication failed. Please try again.');
      setMessage(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb-left" />
      <div className="auth-orb auth-orb-right" />

      <div className="auth-card fade-up">
        <p className="eyebrow">FLEXIPULSE ACCESS</p>
        <h1 className="auth-title">Orange Core Performance</h1>
        <p className="auth-subtitle">Choose your portal and continue into the platform.</p>

        <div className="mode-toggle" role="tablist" aria-label="Auth mode">
          <button
            type="button"
            className={mode === 'login' ? 'toggle-btn toggle-btn-active' : 'toggle-btn'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'toggle-btn toggle-btn-active' : 'toggle-btn'}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <div className="role-grid">
          {roleOptions.map((item) => (
            <button
              type="button"
              key={item.value}
              className={role === item.value ? 'role-card role-card-active' : 'role-card'}
              onClick={() => setRole(item.value)}
            >
              <span className="role-card-title">{item.title}</span>
              <span className="role-card-caption">{item.caption}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              className="neo-input"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          )}

          <input
            className="neo-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {emailError && <p className="field-error">{emailError}</p>}

          <input
            className="neo-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {passwordError && <p className="field-error">{passwordError}</p>}

          {message && <p className="form-error">{message}</p>}

          <button type="submit" disabled={loading} className="primary-cta w-full">
            {loading ? 'Please wait...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
