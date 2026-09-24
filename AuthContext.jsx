import React, { createContext, useContext, useState, useEffect } from 'react';
import { offlineDb } from '../services/offlineDb.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Helper to read stored token
  const getStoredToken = () => {
    return localStorage.getItem('ll_auth_token') || sessionStorage.getItem('ll_auth_token');
  };

  // Helper to store token
  const saveToken = (authToken, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('ll_auth_token', authToken);
      sessionStorage.removeItem('ll_auth_token');
    } else {
      sessionStorage.setItem('ll_auth_token', authToken);
      localStorage.removeItem('ll_auth_token');
    }
    setToken(authToken);
  };

  // Clear token
  const clearToken = () => {
    localStorage.removeItem('ll_auth_token');
    sessionStorage.removeItem('ll_auth_token');
    setToken(null);
    setCurrentUser(null);
  };

  // On mount: check token validity and fetch active user
  useEffect(() => {
    const existingToken = getStoredToken();

    // Fetch demo users for testing convenience
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableUsers(data);
      })
      .catch(() => {});

    if (existingToken) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${existingToken}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(data => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setToken(existingToken);
          } else {
            clearToken();
          }
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Email / Password Login
  const login = async ({ email, password, rememberMe = false, role }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, selectedRole: role })
      });
      const data = await res.json();

      if (res.status === 403 && data.unverified) {
        return { success: false, unverified: true, email: data.email, message: data.message };
      }

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed',
          roleMismatch: Boolean(data.roleMismatch)
        };
      }

      saveToken(data.token, rememberMe);
      setCurrentUser(data.user);

      if (!data.user.profileCompleted && (data.user.role === 'student' || data.user.role === 'teacher')) {
        setIsOnboardingModalOpen(true);
      }

      return { success: true, user: data.user, role: data.role };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Phone + OTP Login
  const loginWithOtp = async ({ phone, otp, rememberMe = false, role }) => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, selectedRole: role })
      });
      const data = await res.json();

      if (res.status === 403 && data.unverified) {
        return { success: false, unverified: true, email: data.email, message: data.message };
      }

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Invalid OTP',
          roleMismatch: Boolean(data.roleMismatch)
        };
      }

      saveToken(data.token, rememberMe);
      setCurrentUser(data.user);

      if (!data.user.profileCompleted && (data.user.role === 'student' || data.user.role === 'teacher')) {
        setIsOnboardingModalOpen(true);
      }

      return { success: true, user: data.user, role: data.role };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // 1-Click Quick Demo Login (for tester evaluation)
  const loginDemo = async (roleOrUserId, rememberMe = false, role) => {
    try {
      const isId = roleOrUserId.startsWith('usr-') || roleOrUserId.startsWith('STU') || roleOrUserId.startsWith('TCH') || roleOrUserId.startsWith('PAR');
      const body = isId
        ? { userId: roleOrUserId, selectedRole: role }
        : { role: roleOrUserId, selectedRole: role || roleOrUserId };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (res.status === 403 && data.unverified) {
        return { success: false, unverified: true, email: data.email, message: data.message };
      }

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Demo login failed',
          roleMismatch: Boolean(data.roleMismatch)
        };
      }

      saveToken(data.token, rememberMe);
      setCurrentUser(data.user);

      if (!data.user.profileCompleted && (data.user.role === 'student' || data.user.role === 'teacher')) {
        setIsOnboardingModalOpen(true);
      }

      return { success: true, user: data.user, role: data.role };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      // Pass through otp so the page can deliver it via EmailJS
      return { success: true, unverified: true, email: data.email, otp: data.otp, message: data.message };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Verify Email
  const verifyEmail = async (email, code) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Verification failed' };
      }

      saveToken(data.token, true);
      setCurrentUser(data.user);
      return { success: true, user: data.user, role: data.role };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Resend verification — passes through otp so the page can re-send via EmailJS
  const resendVerification = async (email) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return data; // includes { success, otp, message }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Forgot password — passes through otp so the page can deliver it via EmailJS
  const forgotPassword = async (email) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return data; // includes { success, otp, message }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Reset password
  const resetPassword = async (email, code, newPassword) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Quick switch role for dev/testing when logged in
  const switchRole = async (targetRole) => {
    const res = await loginDemo(targetRole, true);
    return res;
  };

  // Logout
  const logout = async (clearDevice = false) => {
    const currentTok = token || getStoredToken();
    if (currentTok) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentTok}`
        }
      }).catch(() => {});
    }

    if (clearDevice) {
      await offlineDb.clearSharedDeviceCache();
    }

    clearToken();
  };

  const getAuthHeaders = () => {
    const currentTok = token || getStoredToken();
    return currentTok ? { 'Authorization': `Bearer ${currentTok}` } : {};
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      token,
      isAuthenticated: Boolean(currentUser && token),
      isLoading,
      availableUsers,
      login,
      loginWithOtp,
      loginDemo,
      register,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      logout,
      switchRole,
      getAuthHeaders,
      isOnboardingModalOpen,
      setIsOnboardingModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
