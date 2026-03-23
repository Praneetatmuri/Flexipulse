import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import AIDiet from './pages/AIDiet';
import Auth from './pages/Auth';
import TrainerMembers from './pages/TrainerMembers';
import NotFound from './pages/NotFound';
import { getAuthToken, setAuthToken } from './services/apiService';
import './App.css';

function readStoredUser() {
  try {
    const stored = localStorage.getItem('flexiUser');
    const user = stored ? JSON.parse(stored) : null;
    const token = getAuthToken();
    if (user && !token) {
      localStorage.removeItem('flexiUser');
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function ProtectedRoute({ user, allow, children }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allow && !allow.includes((user.role || '').toUpperCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [currentUser, setCurrentUser] = useState(readStoredUser);

  const normalizedRole = useMemo(
    () => (currentUser?.role || 'MEMBER').toUpperCase(),
    [currentUser]
  );

  const handleAuthSuccess = (authPayload) => {
    const user = authPayload?.user || authPayload;
    const token = authPayload?.token;
    const normalizedUser = {
      ...user,
      role: (user.role || 'MEMBER').toUpperCase(),
    };
    setCurrentUser(normalizedUser);
    localStorage.setItem('flexiUser', JSON.stringify(normalizedUser));
    setAuthToken(token || null);
  };

  const handleLogout = () => {
    localStorage.removeItem('flexiUser');
    setAuthToken(null);
    setCurrentUser(null);
  };

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            background: 'rgba(9,12,17,0.94)',
            color: '#f0f5ff',
            border: '1px solid rgba(255,255,255,0.14)',
          },
        }}
      />
      <Navigation currentUser={currentUser} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/auth"
          element={currentUser ? <Navigate to="/" replace /> : <Auth onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute user={currentUser}>
              <Dashboard currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute user={currentUser} allow={['MEMBER', 'TRAINER']}>
              <Booking currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diet"
          element={
            <ProtectedRoute user={currentUser} allow={['MEMBER', 'TRAINER']}>
              <AIDiet currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/members"
          element={
            <ProtectedRoute user={currentUser} allow={['TRAINER']}>
              <TrainerMembers currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route
          path="*"
          element={currentUser ? <NotFound /> : <Navigate to="/auth" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;

