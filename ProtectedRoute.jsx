import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Verifying LEARNING LOOPS session...
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated — decide where to send them
  if (!isAuthenticated || !currentUser) {
    // Admin routes redirect to the dedicated admin login, not the public login
    const isAdminRoute = location.pathname.startsWith('/admin');
    const loginTarget  = isAdminRoute ? '/admin-login' : '/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  // Block access to any protected dashboard if email unverified
  if (currentUser.email_verified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(currentUser.email || '')}`} replace />;
  }

  // Role authorization: if route is restricted to specific roles
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else if (currentUser.role === 'parent') {
      return <Navigate to="/parent" replace />;
    } else if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

