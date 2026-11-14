import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">Job Tracker</Link>
        <div className="nav-user">
          <span>{user?.name}</span>
          <button className="btn" onClick={() => dispatch(logout())}>Log out</button>
        </div>
      </div>
    </header>
  );
}
