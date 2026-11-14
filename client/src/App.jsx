import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadMe } from './store/authSlice';
import { ProtectedRoute, PublicOnly } from './components/Guards';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';

export default function App() {
  const dispatch = useDispatch();

  // Restore the session from a saved token on first load.
  useEffect(() => {
    if (localStorage.getItem('token')) dispatch(loadMe());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><AuthPage mode="signup" /></PublicOnly>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications/new" element={<ApplicationForm />} />
        <Route path="/applications/:id/edit" element={<ApplicationForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
