import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

const Checking = () => (
  <div className="center">
    <span className="spinner" /> Loading your account…
  </div>
);

// Layout route: only logged-in users get through.
export function ProtectedRoute() {
  const { user, checking } = useSelector((s) => s.auth);
  if (checking) return <Checking />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

// Login and signup pages: logged-in users go straight to the dashboard.
export function PublicOnly({ children }) {
  const { user, checking } = useSelector((s) => s.auth);
  if (checking) return <Checking />;
  return user ? <Navigate to="/" replace /> : children;
}
