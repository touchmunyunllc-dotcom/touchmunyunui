import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProfileAddresses } from '@/components/ProfileAddresses';
import { SEO } from '@/components/SEO';

type ProfileTab = 'account' | 'addresses' | 'security';

const inputClassName =
  'w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-red-500/30 focus:border-red-500/40 bg-black/20 backdrop-blur-sm text-foreground placeholder-foreground/45 transition-all';

const panelClassName =
  'bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg border-2 border-foreground/10';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
      setLoading(false);
    } else {
      void fetchCurrentUser();
    }
  }, [isAuthenticated, user, router]);

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
      setUser(currentUser);
    } catch {
      notificationService.error('Failed to load profile');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const displayName = formData.name.trim() || user?.name || 'Guest';
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notificationService.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      notificationService.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notificationService.error('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile(
        formData.name.trim(),
        formData.email.trim()
      );
      setUser(updatedUser);
      notificationService.success('Profile updated successfully');
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword.trim()) {
      notificationService.error('Current password is required');
      return;
    }
    if (!passwordData.newPassword.trim()) {
      notificationService.error('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      notificationService.error('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notificationService.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      notificationService.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center bg-primary">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const quickLinks = [
    {
      href: '/orders',
      label: 'My Orders',
      description: 'Track purchases & order history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      href: '/help',
      label: 'Help & Support',
      description: 'FAQs and contact options',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <Layout>
      <SEO title="My Profile - Touch Munyun" noindex nofollow />
      <div className="bg-primary min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">Account</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">My Profile</h1>
            <p className="text-foreground/65 mt-2 font-medium">
              Manage your details, password, and account shortcuts.
            </p>
          </div>

          {/* Profile summary */}
          <div className={`${panelClassName} p-6 sm:p-8 mb-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-gold-600/10 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-gold-600 text-lg sm:text-xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{displayName}</h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border ${
                      isAdmin
                        ? 'border-gold-500/40 bg-gold-500/10 text-gold-400'
                        : 'border-red-500/30 bg-red-600/10 text-red-400'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <p className="text-foreground/70 mt-1 truncate">{formData.email || user?.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 lg:gap-8">
            {/* Sidebar */}
            <aside className="space-y-4">
              <nav className={`${panelClassName} p-2`} aria-label="Profile sections">
                {(
                  [
                    { id: 'account' as const, label: 'Account details' },
                    { id: 'addresses' as const, label: 'Shipping addresses' },
                    { id: 'security' as const, label: 'Password & security' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-red-600 text-white shadow-glow-red'
                        : 'text-foreground/75 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className={`${panelClassName} p-3 space-y-2`}>
                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.14em] text-foreground/45">
                  Quick links
                </p>
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-start gap-3 rounded-2xl px-3 py-3 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                  >
                    <span className="mt-0.5 text-red-400 group-hover:text-red-300">{link.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground group-hover:text-red-400 transition-colors">
                        {link.label}
                      </span>
                      <span className="block text-xs text-foreground/55 mt-0.5">{link.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </aside>

            {/* Main panel */}
            <div className={`${panelClassName} p-6 sm:p-8`}>
              {activeTab === 'account' ? (
                <>
                  <div className="mb-6 pb-6 border-b border-foreground/10">
                    <div className="h-0.5 w-10 bg-gradient-to-r from-red-600 to-gold-600 rounded-full mb-4" />
                    <h2 className="text-xl font-bold text-foreground">Account details</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                      Update how your name and email appear on orders and receipts.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="profile-name" className="block text-sm font-semibold text-foreground mb-2">
                        Full name <span className="text-gold-400">*</span>
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClassName}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="profile-email" className="block text-sm font-semibold text-foreground mb-2">
                        Email address <span className="text-gold-400">*</span>
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClassName}
                        placeholder="you@example.com"
                        required
                      />
                      <p className="text-xs text-foreground/55 mt-2">
                        You may need to verify your email if you change it.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Account type</label>
                      <div className="px-4 py-3 rounded-xl border border-foreground/15 bg-black/15 text-foreground/70 text-sm">
                        {isAdmin ? 'Administrator' : 'Customer account'}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-foreground/10">
                      <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="px-5 py-2.5 rounded-xl border border-foreground/20 text-foreground hover:bg-white/5 transition-all font-medium text-sm"
                      >
                        Back to home
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold text-sm shadow-lg hover:shadow-glow-red transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <LoadingSpinner />
                            Saving...
                          </>
                        ) : (
                          'Save changes'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : activeTab === 'addresses' ? (
                <ProfileAddresses />
              ) : (
                <>
                  <div className="mb-6 pb-6 border-b border-foreground/10">
                    <div className="h-0.5 w-10 bg-gradient-to-r from-red-600 to-gold-600 rounded-full mb-4" />
                    <h2 className="text-xl font-bold text-foreground">Password & security</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                      Choose a strong password you don&apos;t use on other sites.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-semibold text-foreground mb-2">
                        Current password <span className="text-gold-400">*</span>
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        autoComplete="current-password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className={inputClassName}
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-semibold text-foreground mb-2">
                          New password <span className="text-gold-400">*</span>
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          autoComplete="new-password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className={inputClassName}
                          placeholder="Min. 6 characters"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-semibold text-foreground mb-2">
                          Confirm password <span className="text-gold-400">*</span>
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          className={inputClassName}
                          placeholder="Repeat new password"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-foreground/10">
                      <button
                        type="button"
                        onClick={() =>
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          })
                        }
                        className="px-5 py-2.5 rounded-xl border border-foreground/20 text-foreground hover:bg-white/5 transition-all font-medium text-sm"
                      >
                        Clear fields
                      </button>
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold text-sm shadow-lg hover:shadow-glow-red transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {changingPassword ? (
                          <>
                            <LoadingSpinner />
                            Updating...
                          </>
                        ) : (
                          'Update password'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
