import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Field from '../components/Field';
import { login, signup, clearError } from '../store/authSlice';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const dispatch = useDispatch();
  const { status, error, errors } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
    setFieldErrors({});
  }, [mode, dispatch]);

  const serverFields = Object.fromEntries((errors || []).map((e) => [e.field, e.message]));
  const err = (name) => fieldErrors[name] || serverFields[name];
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const v = {};
    if (isSignup && form.name.trim().length < 2) v.name = 'Name must be at least 2 characters';
    if (!EMAIL_RE.test(form.email.trim())) v.email = 'Enter a valid email address';
    if (isSignup && form.password.length < 8) v.password = 'Password must be at least 8 characters';
    if (!isSignup && !form.password) v.password = 'Password is required';
    return v;
  };

  const submit = (e) => {
    e.preventDefault();
    const v = validate();
    setFieldErrors(v);
    if (Object.keys(v).length) return;
    dispatch(isSignup ? signup(form) : login({ email: form.email, password: form.password }));
  };

  const loading = status === 'loading';

  return (
    <div className="container">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>{isSignup ? 'Create your account' : 'Log in'}</h1>
        <p className="meta">
          {isSignup ? 'Keep every application in one place.' : 'Pick up where you left off.'}
        </p>
        {error && <div className="alert" role="alert">{error}</div>}
        {isSignup && (
          <Field label="Name" error={err('name')}>
            <input name="name" value={form.name} onChange={change} autoComplete="name" aria-invalid={!!err('name')} />
          </Field>
        )}
        <Field label="Email" error={err('email')}>
          <input name="email" type="email" value={form.email} onChange={change} autoComplete="email" aria-invalid={!!err('email')} />
        </Field>
        <Field label="Password" error={err('password')}>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={change}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            aria-invalid={!!err('password')}
          />
        </Field>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
        {!isSignup && (
          <button
            type="button"
            className="btn btn-block"
            onClick={() => setForm({ ...form, email: 'demo@jobtracker.dev', password: 'Demo@1234' })}
          >
            Fill in demo login
          </button>
        )}
        <p className="meta switch">
          {isSignup ? (
            <>Already have an account? <Link to="/login">Log in</Link></>
          ) : (
            <>New here? <Link to="/signup">Create an account</Link></>
          )}
        </p>
      </form>
    </div>
  );
}
