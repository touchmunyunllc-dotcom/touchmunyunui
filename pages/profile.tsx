import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SEO } from '@/components/SEO';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
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
      // Fetch current user if not in context
      fetchCurrentUser();
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
    } catch (error) {
      notificationService.error('Failed to load profile');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      notificationService.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      notificationService.error('Email is required');
      return;
    }
    
    // Email validation
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
      
      // Update user in context
      setUser(updatedUser);
      
      notificationService.success('Profile updated successfully');
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      notificationService.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordSection(false);
    } catch (error: any) {
      notificationService.error(
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="My Profile - Touch Munyun" noindex nofollow />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
          <p className="text-foreground/70 mt-2 font-medium">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 space-y-6 border-2 border-foreground/10">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Full Name <span className="text-gold-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email Address <span className="text-gold-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
              placeholder="Enter your email address"
              required
            />
            <p className="text-xs text-foreground/60 mt-2 font-medium">
              You may need to verify your email if you change it
            </p>
          </div>

          {/* Role Display (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Account Type
            </label>
            <input
              type="text"
              value={user?.role === 'admin' ? 'Administrator' : 'Customer'}
              disabled
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-primary/40 backdrop-blur-sm text-foreground/60 cursor-not-allowed"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-foreground/10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

        {/* Password Change Section */}
        <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 mt-6 border-2 border-foreground/10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Change Password</h2>
              <p className="text-foreground/70 text-sm mt-1 font-medium">Update your password to keep your account secure</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="px-6 py-3 text-button hover:text-button-200 font-semibold transition-colors bg-primary/60 hover:bg-primary/80 rounded-xl border border-foreground/20"
            >
              {showPasswordSection ? 'Hide' : 'Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Current Password <span className="text-gold-400">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
                  placeholder="Enter your current password"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  New Password <span className="text-gold-400">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
                  placeholder="Enter your new password (min. 6 characters)"
                  required
                  minLength={6}
                />
                <p className="text-xs text-foreground/60 mt-2 font-medium">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Confirm New Password <span className="text-gold-400">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 transition-all"
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-foreground/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="px-6 py-3 border border-foreground/20 rounded-xl text-foreground hover:bg-primary/60 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <LoadingSpinner />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

