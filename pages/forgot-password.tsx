import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { notificationService } from '@/services/notificationService';
import { authService } from '@/services/authService';
import { SEO } from '@/components/SEO';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format before submitting
    if (!validateEmail(email)) {
      return;
    }
    
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setEmailSent(true);
      notificationService.success('If an account with that email exists, a password reset link has been sent!');
    } catch (error: any) {
      // Handle validation errors from backend
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.errors?.[0]?.errorMessage ||
                           'Invalid email format';
        setEmailError(errorMessage);
        notificationService.error(errorMessage);
      } else {
        notificationService.error(
          'Failed to send password reset email. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO title="Forgot Password - Touch Munyun" noindex nofollow />
      <div className="min-h-screen flex items-center justify-center bg-primary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at center, rgba(90, 93, 104, 0.15) 0%, transparent 70%)'
        }} />
        <div className="max-w-md w-full relative z-10">
          <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 sm:p-10 border-2 border-foreground/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-button rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-button-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h2>
              <p className="text-foreground/80">
                {emailSent
                  ? 'Check your email for a password reset link'
                  : "Enter your email address and we'll send you a link to reset your password"}
              </p>
            </div>

            {!emailSent ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    Email Address <span className="text-gold-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-foreground/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => validateEmail(email)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 shadow-glass ${
                        emailError ? 'border-gold-500/50 focus:border-gold-500 focus:ring-gold-500/30' : 'border-foreground/20'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-gold-500 flex items-center gap-1 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {emailError}
                    </p>
                  )}
                  {!emailError && (
                    <p className="mt-2 text-xs text-foreground/60">
                      Enter the email address associated with your account
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-button text-button-text font-semibold py-3 px-4 rounded-xl hover:bg-button-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gold-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-gold-500/30 shadow-glass">
                  <svg
                    className="w-8 h-8 text-gold-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-foreground/80">
                  We&apos;ve sent a password reset link to <strong className="text-foreground">{email}</strong>
                </p>
                <p className="text-sm text-foreground/70">
                  Please check your email and click the link to reset your password. The link will expire in 1 hour.
                </p>
                <p className="text-sm text-foreground/70 mt-2">
                  If you don&apos;t see the email, check your spam folder.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-button hover:text-button-200 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
