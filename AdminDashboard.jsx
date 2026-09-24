import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  Activity,
  UserCheck,
  AlertCircle,
  Search,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  FileText,
  Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AdminYouTubeReview } from './AdminYouTubeReview.jsx';

export const AdminDashboard = () => {
  const { currentUser, getAuthHeaders } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'courses', 'security'
  const [overviewData, setOverviewData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [overviewRes, usersRes] = await Promise.all([
        fetch('/api/admin/overview', { headers: getAuthHeaders() }),
        fetch('/api/admin/users', { headers: getAuthHeaders() })
      ]);

      if (!overviewRes.ok || !usersRes.ok) {
        throw new Error('Failed to load administrative records. Ensure you have ADMIN privileges.');
      }

      const overview = await overviewRes.json();
      const users = await usersRes.json();

      setOverviewData(overview);
      setUsersList(users);
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with administration backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) {
        throw new Error('Failed to change user role');
      }

      setActionSuccess(`Role for user ${userId} updated to ${newRole.toUpperCase()}!`);
      setTimeout(() => setActionSuccess(''), 4000);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px'
        }} />
        <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
          Loading LEARNING LOOPS Admin Portal...
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ color: 'var(--accent-crimson)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>
          Access Denied / Administrative Error
        </div>
        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {errorMsg}
        </div>
        <button className="btn-primary" onClick={fetchAdminData} style={{ margin: '0 auto' }}>
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  const counts = overviewData?.counts || {
    totalUsers: usersList.length,
    students: usersList.filter(u => u.role === 'student').length,
    teachers: usersList.filter(u => u.role === 'teacher').length,
    parents: usersList.filter(u => u.role === 'parent').length,
    admins: usersList.filter(u => u.role === 'admin').length,
    courses: 10,
    tests: 6,
    classes: 3,
    systemStatus: 'Optimal'
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="content-card" style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        color: '#FFFFFF',
        border: 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontWeight: '700', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={18} />
              <span>Platform Governance &amp; Administration</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: '800', marginTop: '6px', color: '#FFFFFF' }}>
              Admin Control Center
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', marginTop: '4px' }}>
              Logged in as <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.code || 'ADM1001'}). Role-based portal security active.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchAdminData}
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.86rem',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="content-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL USERS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{counts.totalUsers}</div>
          </div>
        </div>

        <div className="content-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>STUDENTS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{counts.students}</div>
          </div>
        </div>

        <div className="content-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TEACHERS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{counts.teachers}</div>
          </div>
        </div>

        <div className="content-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--accent-amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>PARENTS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{counts.parents}</div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '2px'
      }}>
        <button
          className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{ width: 'auto', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}
        >
          <Activity size={16} />
          <span>System Overview</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ width: 'auto', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}
        >
          <Users size={16} />
          <span>User Accounts &amp; Roles</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
          style={{ width: 'auto', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}
        >
          <Lock size={16} />
          <span>Role Security Audit</span>
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'youtube' ? 'active' : ''}`}
          onClick={() => setActiveTab('youtube')}
          style={{ width: 'auto', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}
        >
          <Video size={16} />
          <span>YouTube Resources</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="content-card">
            <h2 className="section-title" style={{ marginBottom: '14px' }}>Platform Governance Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} color="var(--accent-primary)" />
                  <span>Database State</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Total Registered Accounts: <strong>{counts.totalUsers}</strong></div>
                  <div>Active Courses: <strong>{counts.courses}</strong></div>
                  <div>Scheduled Assessments: <strong>{counts.tests}</strong></div>
                  <div>Active Classes: <strong>{counts.classes}</strong></div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--accent-sage)" />
                  <span>Security &amp; Role Enforcement</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Role-Based Access Control: <strong style={{ color: 'var(--accent-sage)' }}>STRICT (Enforced)</strong></div>
                  <div>Token Authentication: <strong style={{ color: 'var(--accent-sage)' }}>Active</strong></div>
                  <div>Data Isolation: <strong style={{ color: 'var(--accent-sage)' }}>Active per User / Role</strong></div>
                  <div>Cross-Portal Switching: <strong style={{ color: 'var(--accent-crimson)' }}>Disabled</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Recent User Signups &amp; Registrations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(overviewData?.recentUsers || []).map((u, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{u.email} • ID: {u.code || u.id}</div>
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: u.role === 'student' ? '#EFF6FF' : u.role === 'teacher' ? '#FAF5FF' : u.role === 'parent' ? '#FFFBEB' : '#F1F5F9',
                    color: u.role === 'student' ? '#1D4ED8' : u.role === 'teacher' ? '#7E22CE' : u.role === 'parent' ? '#B45309' : '#334155'
                  }}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Registered User Accounts</h2>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="search-input-wrapper" style={{ minWidth: '220px' }}>
                <Search size={15} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Filter by name, email, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 12px' }}>Code / ID</th>
                  <th style={{ padding: '10px 12px' }}>Name</th>
                  <th style={{ padding: '10px 12px' }}>Email</th>
                  <th style={{ padding: '10px 12px' }}>Current Role</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                      {u.code || u.id}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>{u.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: u.role === 'student' ? '#EFF6FF' : u.role === 'teacher' ? '#FAF5FF' : u.role === 'parent' ? '#FFFBEB' : '#F1F5F9',
                        color: u.role === 'student' ? '#1D4ED8' : u.role === 'teacher' ? '#7E22CE' : u.role === 'parent' ? '#B45309' : '#334155'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {u.email_verified ? (
                        <span style={{ color: 'var(--accent-sage)', fontWeight: '600', fontSize: '0.75rem' }}>● Verified</span>
                      ) : (
                        <span style={{ color: 'var(--accent-amber)', fontWeight: '600', fontSize: '0.75rem' }}>● Unverified</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE SECURITY AUDIT */}
      {activeTab === 'security' && (
        <div className="content-card">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Security Matrix &amp; Role Access Rules</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1E293B', marginBottom: '6px' }}>
                🎓 STUDENT Role Policy
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                Authorized strictly for: <code>/dashboard</code>, <code>/courses</code>, <code>/practice</code>, <code>/tests</code>, <code>/downloads</code>, <code>/resources</code>, <code>/progress</code>, <code>/achievements</code>, <code>/profile</code>.
                <br />
                <strong>Restricted:</strong> Teacher Portal, Parent Portal, and Admin Portal return HTTP 403 Forbidden.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1E293B', marginBottom: '6px' }}>
                👨‍🏫 TEACHER Role Policy
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                Authorized strictly for: <code>/teacher/*</code> (Class Dashboard, Test Builder, Class Analytics, Resources).
                <br />
                <strong>Restricted:</strong> Unauthorized students' dashboards, Parent Portal, and Admin Portal return HTTP 403 Forbidden.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1E293B', marginBottom: '6px' }}>
                👨‍👧 PARENT Role Policy
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                Authorized strictly for: <code>/parent/*</code> (Linked Child Progress, Attendance, Test Performance).
                <br />
                <strong>Restricted:</strong> Teacher Portal, Admin Portal, and other unlinked students' private metrics return HTTP 403 Forbidden.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: '#F8FAFC', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1E293B', marginBottom: '6px' }}>
                🛡️ ADMIN Role Policy
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                Authorized for: Platform Governance, User Account Management, Role Reassignment, and System Analytics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: YOUTUBE RESOURCES GOVERNANCE */}
      {activeTab === 'youtube' && (
        <AdminYouTubeReview />
      )}
    </div>
  );
};
