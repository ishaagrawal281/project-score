"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  User, 
  Mail, 
  KeyRound, 
  LogOut, 
  HardDrive, 
  Crown, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ProfileContent = () => {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  // Profile data & storage
  const [profileData, setProfileData] = useState(user || null);
  const [storageData, setStorageData] = useState({
    usedBytes: 0,
    totalLimitBytes: 100 * 1024 * 1024, // 100 MB limit
    percentage: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Form states - Email
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Premium modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumUpgraded, setPremiumUpgraded] = useState(false);

  // Load profile & storage data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/profile`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      if (res.status === 401) {
        router.push('/login?expired=true');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfileData(data.user);
          setNewEmail(data.user.email || '');
        }
        if (data.storage) {
          setStorageData(data.storage);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // Handler: Change Email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailSuccess('');
    setEmailError('');

    if (!newEmail || !newEmail.trim()) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (newEmail.trim().toLowerCase() === profileData?.email?.toLowerCase()) {
      setEmailError('The new email address is identical to your current email.');
      return;
    }

    setEmailLoading(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/user/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ email: newEmail.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email address.');
      }

      setEmailSuccess('Email address updated successfully.');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      fetchProfile();
    } catch (err) {
      setEmailError(err.message || 'Failed to update email address.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handler: Change Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handler: Delete Account
  const executeDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/user`, {
        method: 'DELETE',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account.');
      }

      await logout();
      router.push('/login?deleted=true');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handler: Sign Out
  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const userInitial = profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-container">
      {/* Navigation Top Header */}
      <header className="profile-nav-header">
        <div className="profile-nav-brand" onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="nav-brand-icon-wrap"><HardDrive size={22} /></div>
          <span>DocVault</span>
        </div>
        <button className="btn btn-secondary back-to-dashboard-btn" onClick={() => router.push('/dashboard')}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </header>

      <main className="profile-main">
        {/* User Identity Banner */}
        <section className="profile-user-card">
          <div className="profile-avatar-xl">{userInitial}</div>
          <div className="profile-user-info">
            <h1 className="profile-user-name">{profileData?.name || user?.name || 'User Account'}</h1>
            <p className="profile-user-email">{profileData?.email || user?.email}</p>
            <div className="profile-badge-row">
              <span className="profile-badge">
                <ShieldCheck size={13} /> Encrypted Vault Account
              </span>
              <span className="profile-badge profile-badge-subtle">
                100 MB Free Plan
              </span>
            </div>
          </div>
        </section>

        {/* 1. SIGN OUT SECTION */}
        <section className="profile-section profile-section-signout">
          <div className="profile-section-header">
            <div>
              <h2 className="profile-section-title">Account Session</h2>
              <p className="profile-section-subtitle">Sign out of your active session on this device.</p>
            </div>
            <button className="btn btn-danger-outline signout-btn" onClick={handleSignOut}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </section>

        {/* 2. CHANGE PASSWORD AND EMAIL SECTION */}
        <section className="profile-section">
          <div className="profile-section-header-simple">
            <User size={20} className="section-icon" />
            <div>
              <h2 className="profile-section-title">Change Password and Email</h2>
              <p className="profile-section-subtitle">Update your account login details and credentials.</p>
            </div>
          </div>

          <div className="profile-forms-grid">
            {/* Update Email Form */}
            <div className="profile-card-box">
              <div className="card-box-header">
                <Mail size={18} />
                <h3>Change Email Address</h3>
              </div>

              {emailSuccess && (
                <div className="alert alert-success">
                  <CheckCircle2 size={16} />
                  <span>{emailSuccess}</span>
                </div>
              )}
              {emailError && (
                <div className="alert alert-danger">
                  <AlertCircle size={16} />
                  <span>{emailError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateEmail}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-email">Email Address</label>
                  <input
                    id="profile-email"
                    type="email"
                    className="form-input"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={emailLoading}>
                  {emailLoading ? 'Updating Email...' : 'Save Email Address'}
                </button>
              </form>
            </div>

            {/* Update Password Form */}
            <div className="profile-card-box">
              <div className="card-box-header">
                <KeyRound size={18} />
                <h3>Change Password</h3>
              </div>

              {passwordSuccess && (
                <div className="alert alert-success">
                  <CheckCircle2 size={16} />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="alert alert-danger">
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label className="form-label" htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 3. STORAGE USAGE SECTION */}
        <section className="profile-section">
          <div className="profile-section-header-simple">
            <HardDrive size={20} className="section-icon" />
            <div>
              <h2 className="profile-section-title">Storage Usage</h2>
              <p className="profile-section-subtitle">Real-time breakdown of space consumed by your uploaded documents.</p>
            </div>
          </div>

          <div className="storage-card-container">
            <div className="storage-card-top">
              <div className="storage-stat-info">
                <span className="storage-stat-value">
                  {formatBytes(storageData.usedBytes)}
                </span>
                <span className="storage-stat-limit">
                  / {formatBytes(storageData.totalLimitBytes)} (100 MB Free Plan)
                </span>
              </div>
              <div className="storage-percentage-badge">
                {storageData.percentage}% Used
              </div>
            </div>

            {/* Storage Progress Completion Bar Matching UI */}
            <div className="profile-storage-bar-track">
              <div 
                className="profile-storage-bar-fill"
                style={{ width: `${Math.min(storageData.percentage, 100)}%` }}
              />
            </div>

            <div className="storage-meta-info">
              <span>{storageData.totalCount || 0} Total Documents Uploaded</span>
              <span>{formatBytes(Math.max(storageData.totalLimitBytes - storageData.usedBytes, 0))} Remaining</span>
            </div>
          </div>
        </section>

        {/* 4. GET PREMIUM SECTION */}
        <section className="profile-section profile-premium-section">
          <div className="premium-card">
            <div className="premium-badge-tag">
              <Sparkles size={14} />
              <span>UPGRADE YOUR VAULT</span>
            </div>

            <div className="premium-content">
              <div className="premium-header">
                <div className="premium-icon-wrap">
                  <Crown size={28} />
                </div>
                <div>
                  <h2 className="premium-title">Get Premium — Unlimited Storage</h2>
                  <p className="premium-subtitle">Remove the 100 MB capacity cap and unlock high-performance vault features.</p>
                </div>
              </div>

              <div className="premium-features-grid">
                <div className="premium-feature-item">
                  <Check size={16} className="feature-check" />
                  <span><strong>Unlimited Storage</strong> space for videos, documents, & media</span>
                </div>
                <div className="premium-feature-item">
                  <Check size={16} className="feature-check" />
                  <span><strong>End-to-End Encryption</strong> for enhanced privacy</span>
                </div>
                <div className="premium-feature-item">
                  <Check size={16} className="feature-check" />
                  <span><strong>Priority Upload Speed</strong> & dedicated Cloudfront CDN</span>
                </div>
                <div className="premium-feature-item">
                  <Check size={16} className="feature-check" />
                  <span><strong>24/7 Priority Support</strong> & automatic file backups</span>
                </div>
              </div>

              <div className="premium-action-bar">
                <button className="btn btn-premium" onClick={() => setShowPremiumModal(true)}>
                  <Zap size={18} />
                  <span>Upgrade to Premium</span>
                </button>
                <span className="premium-price-label">$4.99 / month • Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. DELETE ACCOUNT SECTION (AT END OF PAGE) */}
        <section className="profile-section profile-section-danger">
          <div className="profile-section-header-simple text-danger">
            <Trash2 size={20} className="section-icon-danger" />
            <div>
              <h2 className="profile-section-title text-danger">Delete Account</h2>
              <p className="profile-section-subtitle">Permanently destroy your vault, remove all files and erase your account data.</p>
            </div>
          </div>

          {deleteError && (
            <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="danger-card">
            <div className="danger-card-info">
              <h4>Warning: This action cannot be undone</h4>
              <p>Deleting your account will immediately remove all your uploaded documents, directories, and share links from our servers.</p>
            </div>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={16} />
              <span>Delete My Account</span>
            </button>
          </div>
        </section>
      </main>

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDeleteAccount}
        title="Permanently Delete Account?"
        message="Are you sure you want to delete your account? All your files and data will be permanently purged. This action cannot be reversed."
        confirmText={deleteLoading ? "Deleting Account..." : "Yes, Delete My Account"}
        danger={true}
      />

      {/* Premium Upgrade Modal */}
      {showPremiumModal && (
        <div className="modal-backdrop" onClick={() => setShowPremiumModal(false)}>
          <div className="modal-content premium-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Crown size={24} style={{ color: 'var(--primary)' }} />
                <h3 className="modal-title">DocVault Premium Upgrade</h3>
              </div>
              <button className="modal-close" onClick={() => setShowPremiumModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {premiumUpgraded ? (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <CheckCircle2 size={54} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
                  <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Welcome to DocVault Premium!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Your account has been upgraded to Unlimited Storage.</p>
                  <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={() => setShowPremiumModal(false)}>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                    Unlock infinite storage capacity and advanced features for your account.
                  </p>

                  <div className="premium-modal-plan-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '16px' }}>Unlimited Storage Plan</strong>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>$4.99 / mo</span>
                    </div>
                    <ul style={{ fontSize: '13px', color: 'var(--text-medium)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Unlimited File Size & Storage Space</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Instant High-Speed Downloads</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={14} style={{ color: 'var(--success)' }} /> Enterprise Security Audit Logs</li>
                    </ul>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '15px' }}
                    onClick={() => {
                      setPremiumUpgraded(true);
                      setStorageData(prev => ({ ...prev, totalLimitBytes: 1000 * 1024 * 1024 * 1024, percentage: 0 }));
                    }}
                  >
                    Activate Premium — $4.99/mo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="profile-container"><div className="profile-main">Loading profile...</div></div>}>
        <ProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}
