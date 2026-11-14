import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { STATUSES } from '../constants';
import { fetchApps, fetchStats, deleteApp } from '../store/appsSlice';

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items, stats, total, listStatus, listError, statsError, deletingId, deleteError } = useSelector((s) => s.apps);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState(''); // debounced search text

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    dispatch(fetchApps({ status, search: query }));
  }, [dispatch, status, query]);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const remove = async (app) => {
    if (!window.confirm(`Delete your ${app.company} application?`)) return;
    const result = await dispatch(deleteApp(app._id));
    if (deleteApp.fulfilled.match(result)) dispatch(fetchStats());
  };

  const tiles = [{ key: '', label: 'All', count: total }, ...STATUSES.map((s) => ({ key: s, label: s, count: stats?.[s] }))];
  const filtered = Boolean(status || query);
  const busy = listStatus === 'loading';

  return (
    <>
      <div className="page-head">
        <h1>Your applications</h1>
        <Link to="/applications/new" className="btn btn-primary">Add application</Link>
      </div>

      <div className="pipeline" role="group" aria-label="Filter by status">
        {tiles.map((t) => (
          <button
            key={t.key || 'all'}
            className="tile"
            style={t.key ? { '--c': `var(--s-${t.key})` } : undefined}
            aria-pressed={status === t.key}
            onClick={() => setStatus(t.key)}
          >
            <strong>{stats ? t.count : '–'}</strong>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      {statsError && (
        <div className="alert" role="alert">
          {statsError} <button className="btn" onClick={() => dispatch(fetchStats())}>Retry</button>
        </div>
      )}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by company"
          aria-label="Search by company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filtered && (
          <button className="btn" onClick={() => { setStatus(''); setSearch(''); setQuery(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {deleteError && <div className="alert" role="alert">{deleteError}</div>}

      {listStatus === 'failed' ? (
        <div className="alert" role="alert">
          {listError} <button className="btn" onClick={() => dispatch(fetchApps({ status, search: query }))}>Try again</button>
        </div>
      ) : busy && items.length === 0 ? (
        <div className="center"><span className="spinner" /> Loading applications…</div>
      ) : items.length === 0 ? (
        <div className="empty">
          {filtered ? (
            <p>No applications match these filters.</p>
          ) : (
            <>
              <p>No applications yet. Add the first job you have applied to.</p>
              <Link to="/applications/new" className="btn btn-primary">Add application</Link>
            </>
          )}
        </div>
      ) : (
        <ul className={`list${busy ? ' busy' : ''}`}>
          {items.map((a) => (
            <li key={a._id} className="card" style={{ '--c': `var(--s-${a.status})` }}>
              <div className="card-top">
                <div>
                  <h2>{a.company}</h2>
                  <div>{a.role}</div>
                </div>
                <span className="badge">{a.status}</span>
              </div>
              <div className="meta">Applied {fmtDate(a.appliedDate)}</div>
              {a.notes && <p className="notes">{a.notes}</p>}
              <div className="actions">
                <Link to={`/applications/${a._id}/edit`} className="btn">Edit</Link>
                <button className="btn btn-danger" onClick={() => remove(a)} disabled={deletingId === a._id}>
                  {deletingId === a._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
