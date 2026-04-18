import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { useRecaptcha } from '@/utils/useRecaptcha';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { executeRecaptcha } = useRecaptcha();

  const validateName = (nameValue: string): boolean => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return false;
    }
    if (trimmed.length > 255) {
      setNameError('Name must not exceed 255 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    if (emailValue.length > 255) {
      setEmailError('Email must not exceed 255 characters');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (passwordValue.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    if (passwordValue.length > 100) {
      setPasswordError('Password must not exceed 100 characters');
      return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(passwordValue);
    const hasLowerCase = /[a-z]/.test(passwordValue);
    const hasNumber = /\d/.test(passwordValue);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmValue: string, passwordValue: string): boolean => {
    if (!confirmValue) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    
    if (confirmValue !== passwordValue) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      // Get reCAPTCHA token
      const captchaToken = await executeRecaptcha('register');

      // Trim name before sending
      await register(email.trim().toLowerCase(), password, name.trim(), captchaToken);
      notificationService.success('Account created successfully!');
      router.push('/');
    } catch (error: any) {
      // Handle validation errors from backend
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.errors?.[0]?.errorMessage ||
                           'Registration failed. Please check your information.';
        
        // Check if it's an email already exists error
        if (errorMessage.toLowerCase().includes('email')) {
          setEmailError(errorMessage);
        } else {
          notificationService.error(errorMessage);
        }
      } else {
        notificationService.error(
          error.response?.data?.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Create Account - Touch Munyun" noindex nofollow />
      <Layout>
      <div className="min-h-screen flex items-center justify-center bg-primary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at center, rgba(90, 93, 104, 0.15) 0%, transparent 70%)'
        }} />
        <div className="max-w-md w-full relative z-10">
          {/* Card */}
          <div className="bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-8 sm:p-10 border-2 border-foreground/20">
            {/* Header */}
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
              <p className="text-foreground/80">Join us and start shopping today</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Full Name <span className="text-button">*</span>
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    onBlur={() => validateName(name)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all ${
                      nameError ? 'border-gold-500/50 focus:border-gold-500 focus:ring-gold-500/30' : 'border-foreground/20 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {nameError && (
                  <p className="mt-2 text-sm text-gold-500 flex items-center gap-1 font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {nameError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Email Address <span className="text-button">*</span>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    onBlur={() => validateEmail(email)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all ${
                      emailError ? 'border-gold-500/50 focus:border-gold-500 focus:ring-gold-500/30' : 'border-foreground/20 bg-primary/60 text-foreground placeholder-foreground/50'
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
                  <p className="mt-2 text-xs text-foreground/70">
                    We&apos;ll never share your email with anyone
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Password <span className="text-button">*</span>
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      // Re-validate confirm password if it has a value
                      if (confirmPassword) {
                        validateConfirmPassword(confirmPassword, e.target.value);
                      }
                    }}
                    onBlur={() => validatePassword(password)}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all ${
                      passwordError ? 'border-gold-500/50 focus:border-gold-500 focus:ring-gold-500/30' : 'border-foreground/20 bg-primary/60 text-foreground placeholder-foreground/50'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-foreground/60 hover:text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-foreground/60 hover:text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-gold-500 flex items-center gap-1 font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </p>
                )}
                {!passwordError && (
                  <p className="mt-2 text-xs text-foreground/70">
                    Must be at least 6 characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Confirm Password <span className="text-button">*</span>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword, password)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all ${
                      confirmPasswordError ? 'border-gold-500/50 focus:border-gold-500 focus:ring-gold-500/30' : 'border-foreground/20 bg-primary/60 text-foreground placeholder-foreground/50'
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {confirmPasswordError && (
                  <p className="mt-2 text-sm text-gold-500 flex items-center gap-1 font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-button focus:ring-button/50 border-foreground/20 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-foreground">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-button hover:text-button-200 underline font-medium"
                  >
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-button hover:text-button-200 underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {!termsAccepted && (
                <p className="text-sm text-gold-500 flex items-center gap-1 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  You must accept the Terms and Conditions to create an account
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !termsAccepted}
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/70">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-button hover:text-button-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary/90 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-foreground/20">
            {/* Modal Header */}
            <div className="bg-button text-button-text px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-button-text hover:text-button-text/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <div className="prose max-w-none">
                <p className="text-sm text-foreground/70 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                
                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">1. Acceptance of Terms</h3>
                <p className="text-foreground/80 mb-4">
                  By accessing and using TouchMunyun, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2. Account Registration</h3>
                <p className="text-foreground/80 mb-4">
                  You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account and password.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">3. User Responsibilities</h3>
                <p className="text-foreground/80 mb-4">
                  You agree to use our services only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the service.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">4. Product Information</h3>
                <p className="text-foreground/80 mb-4">
                  We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">5. Pricing and Payment</h3>
                <p className="text-foreground/80 mb-4">
                  All prices are in USD unless otherwise stated. We reserve the right to change prices at any time. Payment must be made at the time of purchase.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">6. Shipping and Delivery</h3>
                <p className="text-foreground/80 mb-4">
                  Shipping costs and delivery times will be calculated at checkout. We are not responsible for delays caused by shipping carriers.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">7. Returns and Refunds</h3>
                <p className="text-foreground/80 mb-4">
                  Returns are accepted within 30 days of purchase, provided items are in original condition. Refunds will be processed to the original payment method.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">8. Privacy Policy</h3>
                <p className="text-foreground/80 mb-4">
                  Your use of our service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">9. Intellectual Property</h3>
                <p className="text-foreground/80 mb-4">
                  All content on this website, including text, graphics, logos, and images, is the property of TouchMunyun and protected by copyright laws.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">10. Limitation of Liability</h3>
                <p className="text-foreground/80 mb-4">
                  TouchMunyun shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of our services.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">11. Changes to Terms</h3>
                <p className="text-foreground/80 mb-4">
                  We reserve the right to modify these terms at any time. Your continued use of the service after changes constitutes acceptance of the new terms.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">12. Contact Information</h3>
                <p className="text-foreground/80 mb-4">
                  If you have any questions about these Terms and Conditions, please contact us at TouchMunyunLLC@gmail.com
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-foreground/20 px-6 py-4 flex items-center justify-between bg-primary/80">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 text-foreground border border-foreground/20 rounded-lg hover:bg-primary transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="px-6 py-2 bg-button text-button-text rounded-lg hover:bg-button-200 transition-all font-semibold"
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    </>
  );}