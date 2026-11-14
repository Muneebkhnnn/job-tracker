import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Field from '../components/Field';
import { STATUSES } from '../constants';
import { api } from '../api';
import { createApp, updateApp } from '../store/appsSlice';

const today = () => new Date().toISOString().slice(0, 10);

export default function ApplicationForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ company: '', role: '', status: 'Applied', appliedDate: today(), notes: '' });
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    setLoading(true);
    api(`/applications/${id}`)
      .then(({ application: a }) => {
        if (cancelled) return;
        setForm({ company: a.company, role: a.role, status: a.status, appliedDate: a.appliedDate.slice(0, 10), notes: a.notes || '' });
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, editing]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const v = {};
    if (!form.company.trim()) v.company = 'Company is required';
    if (!form.role.trim()) v.role = 'Role is required';
    if (!form.appliedDate || Number.isNaN(Date.parse(form.appliedDate))) v.appliedDate = 'Enter a valid date';
    if (form.notes.length > 1000) v.notes = 'Notes must be 1000 characters or fewer';
    return v;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    setFieldErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await dispatch(editing ? updateApp({ id, body: form }) : createApp(form)).unwrap();
      navigate('/');
    } catch (err) {
      setSubmitError(err.message);
      setFieldErrors(Object.fromEntries((err.errors || []).map((x) => [x.field, x.message])));
      setSaving(false);
    }
  };

  if (loading) return <div className="center"><span className="spinner" /> Loading application…</div>;
  if (loadError) {
    return (
      <>
        <div className="alert" role="alert">{loadError}</div>
        <Link to="/" className="btn">Back to dashboard</Link>
      </>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <h1>{editing ? 'Edit application' : 'Add application'}</h1>
      {submitError && <div className="alert" role="alert">{submitError}</div>}
      <div className="row">
        <Field label="Company" error={fieldErrors.company}>
          <input name="company" value={form.company} onChange={change} aria-invalid={!!fieldErrors.company} />
        </Field>
        <Field label="Role" error={fieldErrors.role}>
          <input name="role" value={form.role} onChange={change} aria-invalid={!!fieldErrors.role} />
        </Field>
      </div>
      <div className="row">
        <Field label="Status" error={fieldErrors.status}>
          <select name="status" value={form.status} onChange={change}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Applied date" error={fieldErrors.appliedDate}>
          <input name="appliedDate" type="date" value={form.appliedDate} onChange={change} aria-invalid={!!fieldErrors.appliedDate} />
        </Field>
      </div>
      <Field label="Notes" error={fieldErrors.notes}>
        <textarea name="notes" rows="4" value={form.notes} onChange={change} aria-invalid={!!fieldErrors.notes} />
      </Field>
      <div className="actions">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add application'}
        </button>
        <Link to="/" className="btn">Cancel</Link>
      </div>
    </form>
  );
}
