import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ErrorMessage } from '../components/ErrorMessage';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const RESEND_COOLDOWN = 60; // seconds

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, sendOTP, googleLogin, loading, error } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Stage: 'form' | 'otp'
  const [stage, setStage] = useState('form');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(formData.email)) errors.email = 'Enter a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Stage 1 submit: send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!validateForm()) return;
    try {
      await sendOTP(formData.name, formData.email, formData.password);
      setStage('otp');
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Stage 2 submit: verify OTP and create account
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!otp.trim() || otp.length !== 6) {
      setLocalError('Please enter the 6-digit code');
      return;
    }
    try {
      await register(formData.name, formData.email, formData.password, otp.trim());
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Verification failed');
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLocalError('');
    setOtp('');
    try {
      await sendOTP(formData.name, formData.email, formData.password);
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLocalError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md text-gray-600 dark:text-gray-200 hover:scale-110 transition-transform"
        title="Toggle dark mode"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">

        {/* ── Stage 1: Registration Form ── */}
        {stage === 'form' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
              <p className="text-gray-600 dark:text-gray-400">Start your journey with IntervuAI</p>
            </div>

            <ErrorMessage message={localError || error} />

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
                {fieldErrors.name && <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>}
              </div>

              <div>
                <Input
                  type="text"
                  name="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <Input
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                {fieldErrors.password && <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>}
              </div>

              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending code...' : 'Send Verification Code →'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setLocalError('Google sign-in failed. Please try again.')}
                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                shape="rectangular"
                width="100%"
              />
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* ── Stage 2: OTP Verification ── */}
        {stage === 'otp' && (
          <>
            <div className="text-center mb-8">
              {/* Email icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We sent a 6-digit verification code to
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold">{formData.email}</p>
            </div>

            <ErrorMessage message={localError || error} />

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="● ● ● ● ● ●"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                    setLocalError('');
                  }}
                  className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </Button>
            </form>

            {/* Resend + Back */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-gray-400 dark:text-gray-500">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </p>
              <button
                onClick={() => { setStage('form'); setLocalError(''); setOtp(''); }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 mx-auto"
              >
                ← Change email or go back
              </button>
            </div>
          </>
        )}

      </Card>
    </div>
  );
}
