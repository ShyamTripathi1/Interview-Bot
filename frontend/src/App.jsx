import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Video,
  HelpCircle,
  FileText,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';

/* ── Auth Context ──────────────────────────────────────────────── */
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/* ── Protected Route ───────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

/* ── Sidebar ───────────────────────────────────────────────────── */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard',       path: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Chat',     path: '/chat',      icon: MessageSquare },
    { name: 'Mock Interview',  path: '/interview', icon: Video },
    { name: 'Quiz Assessment', path: '/quiz',      icon: HelpCircle },
    { name: 'Resume Enhancer', path: '/resume',    icon: FileText },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo-container">
        <div className="logo-icon">IB</div>
        <span className="logo-text">InterviewBot</span>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="nav-menu">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">


        {/* User profile */}
        {user && (
          <div className="user-profile-bar">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#F4801F' }}>
                {user.name}
              </div>
              <div style={{ color: '#5C4F3A', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <button onClick={logout} className="logout-btn">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
};

/* ── Page Imports ──────────────────────────────────────────────── */
import LandingPage    from './pages/LandingPage';
import Dashboard      from './pages/Dashboard';
import CareerChat     from './pages/CareerChat';
import MockInterview  from './pages/MockInterview';
import QuizAssessment from './pages/QuizAssessment';
import ResumeEnhancer from './pages/ResumeEnhancer';
import Login          from './pages/Login';
import Register       from './pages/Register';

/* ── App Content ───────────────────────────────────────────────── */
function AppContent() {
  const { token } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);
  const showSidebar = token && !isAuthPage;

  return (
    <>
      {/* Animated background layer */}
      <div className="app-bg" />

      <div className="app-container">
        {showSidebar && <Sidebar />}

        <div
          className={showSidebar ? 'main-content' : ''}
          style={!showSidebar ? { width: '100%', position: 'relative', zIndex: 1 } : {}}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/"         element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            <Route path="/login"    element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat"      element={<ProtectedRoute><CareerChat /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
            <Route path="/quiz"      element={<ProtectedRoute><QuizAssessment /></ProtectedRoute>} />
            <Route path="/resume"    element={<ProtectedRoute><ResumeEnhancer /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

/* ── Root App ──────────────────────────────────────────────────── */
export default function App() {
  const [token, setToken]   = useState(localStorage.getItem('token') || null);
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) { setUser(null); setLoading(false); return; }
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch {
        console.error('Auth check failed');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = (jwtToken, userData) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      <Router>
        <AppContent />
      </Router>
    </AuthContext.Provider>
  );
}
