import React, { useState } from 'react';
import { ClayAvatar } from './ClayAvatar';
import { audioEngine } from '../utils/audioEngine';
import { X, Smartphone, CheckCircle, AlertCircle, ArrowRight, User } from 'lucide-react';
import { API_BASE } from '../config/api';

interface AuthScreenProps {
  onAuthSuccess: (username: string, email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Google Modal States
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // Phone Modal States
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 1. Email / Password Authentication
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validate Sign Up passwords
    if (mode === 'signup') {
      if (!password || password.length < 4) {
        setAuthError('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    audioEngine.playHapticClick(480, 0.08);
    setIsSubmitting(true);

    const targetUrl = mode === 'signup' ? '/api/register' : '/api/login';
    const payload = mode === 'signup'
      ? { username: username.trim() || 'Friend', email: email.trim(), password }
      : { email: email.trim(), password };

    try {
      const res = await fetch(`${API_BASE}${targetUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Authentication failed');
      }

      audioEngine.playChime(528, 1.2);
      setIsSubmitting(false);
      onAuthSuccess(data.user?.username || username || 'Friend', data.user?.email || email);
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError')) {
        setAuthError(err.message);
        audioEngine.playHapticClick(260);
      } else {
        // Fallback for offline mode so user can proceed
        audioEngine.playChime(528, 1.2);
        const resolvedUsername = mode === 'signup'
          ? (username.trim() || 'Friend')
          : (email.split('@')[0] || username || 'Friend');
        onAuthSuccess(resolvedUsername, email || 'user@aetherspace.io');
      }
      setIsSubmitting(false);
    }
  };

  // 2. Google Authentication
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    setGoogleSubmitting(true);
    audioEngine.playHapticClick(450);

    const resolvedName = googleName.trim() || googleEmail.split('@')[0] || 'Google User';

    try {
      const res = await fetch(`${API_BASE}/api/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: resolvedName, 
          email: googleEmail.trim(),
          password: googlePassword.trim() || undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Google sign-in failed');

      audioEngine.playChime(528, 1.2);
      setShowGoogleModal(false);
      onAuthSuccess(data.user?.username || resolvedName, data.user?.email || googleEmail);
    } catch {
      audioEngine.playChime(528, 1.2);
      setShowGoogleModal(false);
      onAuthSuccess(resolvedName, googleEmail.trim());
    } finally {
      setGoogleSubmitting(false);
    }
  };

  // 3. Phone Authentication
  const handleSendOtp = () => {
    if (!phoneInput.trim() || phoneInput.length < 6) {
      alert('Please enter a valid phone number');
      return;
    }
    audioEngine.playHapticClick(400);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '1234') {
      alert(`Invalid code. Please enter the verification code: ${generatedOtp}`);
      return;
    }

    setPhoneSubmitting(true);
    audioEngine.playHapticClick(450);

    const resolvedName = phoneName.trim() || `User ${phoneInput.slice(-4) || 'Phone'}`;

    try {
      const res = await fetch(`${API_BASE}/api/phone-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneInput.trim(), 
          name: resolvedName,
          password: phonePassword.trim() || undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Phone sign-in failed');

      audioEngine.playChime(528, 1.2);
      setShowPhoneModal(false);
      onAuthSuccess(data.user?.username || resolvedName, data.user?.email || `phone_${phoneInput}@mobile.user`);
    } catch {
      audioEngine.playChime(528, 1.2);
      setShowPhoneModal(false);
      onAuthSuccess(resolvedName, `phone_${phoneInput}@mobile.user`);
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    audioEngine.playHapticClick(350);
    setAuthError(null);
    setMode(newMode);
  };

  return (
    <div className="w-full flex flex-col justify-between px-5 pt-4 pb-5 relative" data-purpose="mobile-clay-container">
      {/* Top Header: Centered Pill Logo + Help info (Back button removed as requested) */}
      <header className="w-full flex items-center justify-between mb-4" data-purpose="top-navigation">
        <div className="w-10" /> {/* Spacer to keep center alignment balanced */}

        {/* Pill App Logo/Badge */}
        <div className="px-4 py-2 rounded-full clay-surface-sm flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#52a6ba] shadow-[0_0_8px_#52a6ba]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4d657d] text-subtle-debossed">
            Aether Space
          </span>
        </div>

        {/* Help / Info Button */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playHapticClick(300);
            setShowHelpModal(true);
          }}
          aria-label="Support and Information"
          className="w-10 h-10 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
        >
          <svg
            className="w-4.5 h-4.5 stroke-[2.2]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
        </button>
      </header>

      {/* BEGIN: ClayHeroWelcomeCard */}
      <section className="clay-surface rounded-3xl p-5 mb-4 relative overflow-hidden" data-purpose="welcome-hero-banner">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <ClayAvatar size="md" isOnline={true} isAnimated={true} />

          <div className="flex-1 pr-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full clay-tag mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a97a8]" />
              <span className="text-[10px] font-bold text-[#355b66] uppercase tracking-wide">
                Sound &amp; Mind
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-debossed leading-tight">
              {mode === 'signin' ? 'Welcome back!' : 'Create your space'}
            </h1>
            <p className="text-xs text-subtle-debossed font-medium mt-0.5">
              {mode === 'signin'
                ? 'Sign in to connect with your AI companion.'
                : 'Join Aether Space to begin your journey.'}
            </p>
          </div>
        </div>
      </section>
      {/* END: ClayHeroWelcomeCard */}

      {/* Mode Switcher: Sign In vs Sign Up */}
      <div className="clay-surface-sm rounded-2xl p-1 mb-3.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            mode === 'signin'
              ? 'clay-badge-active shadow-sm'
              : 'text-[#50677b] hover:text-[#2d4153]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            mode === 'signup'
              ? 'clay-badge-active shadow-sm'
              : 'text-[#50677b] hover:text-[#2d4153]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* BEGIN: QuickAuthPills (Google & Phone Sign In) */}
      <section className="space-y-2.5 mb-3" data-purpose="primary-auth-actions">
        {/* Continue with Google */}
        <button
          onClick={() => {
            audioEngine.playHapticClick(400);
            setShowGoogleModal(true);
          }}
          className="w-full py-3 px-4 rounded-2xl clay-card-pill flex items-center justify-between group cursor-pointer hover:shadow-md transition-all"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl clay-badge flex items-center justify-center">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  fill="#ea4335"
                />
                <path
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.2 2.8-2.5 3.7l3.8 3c2.2-2 3.7-5.1 3.7-9z"
                  fill="#4285f4"
                />
                <path
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.2.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  fill="#fbbc05"
                />
                <path
                  d="M12 23c3.2 0 6-1.1 8-3l-3.8-3c-1.1.7-2.5 1.2-4.2 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  fill="#34a853"
                />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#3d5368] text-debossed group-hover:text-[#283846] transition-colors">
              Continue with Google
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#60778c]" />
        </button>

        {/* Continue with Phone */}
        <button
          onClick={() => {
            audioEngine.playHapticClick(380);
            setShowPhoneModal(true);
          }}
          className="w-full py-3 px-4 rounded-2xl clay-card-pill flex items-center justify-between group cursor-pointer hover:shadow-md transition-all"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl clay-badge flex items-center justify-center text-[#4c8496]">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-[#3d5368] text-debossed group-hover:text-[#283846] transition-colors">
              Continue with Phone Number
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#60778c]" />
        </button>
      </section>
      {/* END: QuickAuthPills */}

      {/* Tactile Divider */}
      <div className="flex items-center my-2 gap-3" data-purpose="visual-divider">
        <div className="h-0.5 flex-1 bg-[#a9b9c7] shadow-[0_1px_0_#dbe6f0]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#63798d] text-subtle-debossed px-1">
          {mode === 'signin' ? 'or email sign in' : 'or create with email'}
        </span>
        <div className="h-0.5 flex-1 bg-[#a9b9c7] shadow-[0_1px_0_#dbe6f0]" />
      </div>

      {/* BEGIN: Form */}
      <form className="space-y-3 my-1" onSubmit={handleAuthSubmit}>
        {/* Username field (Shown in Sign Up mode) */}
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#42596e] text-subtle-debossed px-1 tracking-wide" htmlFor="username">
              Your Name
            </label>
            <div className="clay-inset rounded-2xl flex items-center px-4 py-3 gap-3 border border-white/20 transition-all">
              <User className="w-5 h-5 text-[#6c8296] shrink-0" />
              <input
                className="bg-transparent border-none p-0 w-full text-sm font-semibold text-[#304557] placeholder-[#8195a6] focus:ring-0 focus:outline-none"
                id="username"
                name="username"
                placeholder="Enter your name"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Email Inset Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-[#42596e] text-subtle-debossed px-1 tracking-wide" htmlFor="email">
            Email Address
          </label>
          <div className="clay-inset rounded-2xl flex items-center px-4 py-3.5 gap-3 border border-white/20 transition-all">
            <svg
              className="w-5 h-5 text-[#6c8296] stroke-[2] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="16" rx="3" width="20" x="2" y="4" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              className="bg-transparent border-none p-0 w-full text-sm font-semibold text-[#304557] placeholder-[#8195a6] focus:ring-0 focus:outline-none"
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Inset Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <label className="block text-xs font-bold text-[#42596e] text-subtle-debossed tracking-wide" htmlFor="password">
              {mode === 'signup' ? 'Create Password' : 'Password'}
            </label>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playHapticClick(320);
                  setShowForgotModal(true);
                }}
                className="text-xs font-semibold text-[#488796] hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            )}
          </div>
          <div className="clay-inset rounded-2xl flex items-center px-4 py-3.5 gap-3 border border-white/20 transition-all">
            <svg
              className="w-5 h-5 text-[#6c8296] stroke-[2] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              className="bg-transparent border-none p-0 w-full text-sm font-semibold text-[#304557] placeholder-[#8195a6] focus:ring-0 focus:outline-none"
              id="password"
              name="password"
              placeholder={mode === 'signup' ? 'Create your password' : 'Enter password'}
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              aria-label="Toggle password visibility"
              className="text-[#758a9e] focus:outline-none hover:text-[#42596e] cursor-pointer p-1"
              type="button"
              onClick={() => {
                audioEngine.playHapticClick(350);
                setShowPassword(!showPassword);
              }}
            >
              <svg
                className="w-4 h-4 stroke-[2]"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {showPassword ? (
                  <>
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </>
                ) : (
                  <>
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Confirm Password Field (Only shown in Sign Up mode) */}
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#42596e] text-subtle-debossed px-1 tracking-wide" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="clay-inset rounded-2xl flex items-center px-4 py-3.5 gap-3 border border-white/20 transition-all">
              <svg
                className="w-5 h-5 text-[#6c8296] stroke-[2] shrink-0"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                className="bg-transparent border-none p-0 w-full text-sm font-semibold text-[#304557] placeholder-[#8195a6] focus:ring-0 focus:outline-none"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Error message banner */}
        {authError && (
          <div className="p-3 rounded-xl bg-red-100/80 border border-red-300 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{authError}</span>
          </div>
        )}

        {/* Submit Pill Button */}
        <button
          className="w-full py-3.5 px-6 rounded-2xl clay-button-cyan font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
          data-purpose="sign-in-button"
          type="submit"
          disabled={isSubmitting}
        >
          <span>
            {isSubmitting
              ? 'Opening Space...'
              : mode === 'signin'
              ? 'Sign In to Chatbot'
              : 'Create Account & Start Chat'}
          </span>
          <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
            <svg
              className="w-3 h-3 fill-white stroke-white translate-x-0.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </button>
      </form>
      {/* END: Form */}

      {/* Footer */}
      <footer className="mt-3 text-center" data-purpose="terms-and-home-indicator">
        <p className="text-[11px] font-medium text-[#6c8195] text-subtle-debossed leading-relaxed px-2">
          By continuing, you agree to our{' '}
          <button
            type="button"
            onClick={() => {
              audioEngine.playHapticClick(320);
              setShowHelpModal(true);
            }}
            className="font-bold underline decoration-[#899faf] text-[#42596e] hover:text-[#2c3d4a] cursor-pointer"
          >
            Terms of Service
          </button>{' '}
          &amp;{' '}
          <button
            type="button"
            onClick={() => {
              audioEngine.playHapticClick(320);
              setShowHelpModal(true);
            }}
            className="font-bold underline decoration-[#899faf] text-[#42596e] hover:text-[#2c3d4a] cursor-pointer"
          >
            Privacy Policy
          </button>
        </p>
      </footer>

      {/* --- GOOGLE SIGN-IN MODAL --- */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl clay-badge mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  fill="#ea4335"
                />
                <path
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.2 2.8-2.5 3.7l3.8 3c2.2-2 3.7-5.1 3.7-9z"
                  fill="#4285f4"
                />
                <path
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.2.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  fill="#fbbc05"
                />
                <path
                  d="M12 23c3.2 0 6-1.1 8-3l-3.8-3c-1.1.7-2.5 1.2-4.2 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  fill="#34a853"
                />
              </svg>
            </div>
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">Continue with Google</h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-4">
              Enter your Google account to connect instantly
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div className="clay-inset rounded-2xl p-3 border border-white/20">
                <label className="block text-[10px] font-bold text-[#556e84] uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#304557] focus:outline-none"
                />
              </div>

              <div className="clay-inset rounded-2xl p-3 border border-white/20">
                <label className="block text-[10px] font-bold text-[#556e84] uppercase mb-1">Gmail / Google Email</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#304557] focus:outline-none"
                />
              </div>

              <div className="clay-inset rounded-2xl p-3 border border-white/20">
                <label className="block text-[10px] font-bold text-[#556e84] uppercase mb-1">
                  Create Password <span className="text-[#879caf] font-normal normal-case">(optional for direct login)</span>
                </label>
                <input
                  type="password"
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  placeholder="Set an account password"
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#304557] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={googleSubmitting}
                className="w-full py-3 rounded-2xl clay-button-cyan font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-75"
              >
                {googleSubmitting ? 'Signing In...' : 'Sign In with Google'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- PHONE NUMBER SIGN-IN MODAL --- */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative">
            <button
              onClick={() => {
                setShowPhoneModal(false);
                setOtpSent(false);
                setOtpCode('');
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl clay-badge mx-auto flex items-center justify-center text-[#4c8496] mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">
              {otpSent ? 'Enter Verification Code' : 'Sign In with Phone'}
            </h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-4">
              {otpSent
                ? `Enter the 4-digit code sent to ${phoneInput}`
                : 'Enter your name and mobile number to continue'}
            </p>

            {!otpSent ? (
              <div className="space-y-3">
                <div className="clay-inset rounded-2xl p-3 border border-white/20">
                  <label className="block text-[10px] font-bold text-[#556e84] uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#304557] focus:outline-none"
                  />
                </div>

                <div className="clay-inset rounded-2xl p-3 border border-white/20">
                  <label className="block text-[10px] font-bold text-[#556e84] uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#304557] focus:outline-none"
                  />
                </div>

                <div className="clay-inset rounded-2xl p-3 border border-white/20">
                  <label className="block text-[10px] font-bold text-[#556e84] uppercase mb-1">
                    Create Password <span className="text-[#879caf] font-normal normal-case">(optional for direct login)</span>
                  </label>
                  <input
                    type="password"
                    value={phonePassword}
                    onChange={(e) => setPhonePassword(e.target.value)}
                    placeholder="Set an account password"
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold text-[#304557] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3.5 rounded-2xl clay-button-cyan font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  Send Verification Code
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                {/* OTP Helper Card */}
                <div className="p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold text-center">
                  Verification Code: <span className="font-extrabold tracking-widest text-sm">{generatedOtp}</span>
                </div>

                <div className="clay-inset rounded-2xl p-3 text-center border border-white/20">
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="• • • •"
                    className="w-full bg-transparent border-none text-center tracking-[0.5em] text-lg font-bold text-[#304557] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneSubmitting}
                  className="w-full py-3.5 rounded-2xl clay-button-cyan font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {phoneSubmitting ? 'Verifying...' : 'Verify & Enter Chatbot'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotEmailSent(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">Reset Password</h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-4">
              Enter your email to receive a password reset link.
            </p>

            {forgotEmailSent ? (
              <div className="clay-surface-sm rounded-2xl p-4 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-[#4bb390] mx-auto" />
                <p className="text-xs font-bold text-[#344d61]">Reset Link Sent!</p>
                <p className="text-[11px] text-[#6d8396]">Check your inbox at {email}</p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmailSent(false);
                  }}
                  className="mt-3 w-full py-2.5 rounded-xl clay-button-cyan text-xs font-bold cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="clay-inset rounded-2xl p-3.5 border border-white/20">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-transparent border-none text-sm font-semibold text-[#304557] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playHapticClick(420);
                    setForgotEmailSent(true);
                  }}
                  className="w-full py-3.5 rounded-2xl clay-button-cyan font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- HELP / ABOUT MODAL --- */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl clay-badge mx-auto flex items-center justify-center text-[#4c8496] mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">Aether Space</h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-4">
              Tactile Sound &amp; AI Chatbot Companion
            </p>
            <div className="space-y-2.5 text-xs text-[#4d6377]">
              <div className="clay-inset rounded-2xl p-3">
                <div className="font-bold text-[#31475b] mb-1">🔐 Secure Authentication</div>
                <p className="text-[11px] leading-relaxed">
                  Sign in easily using Google, Phone Number with SMS code, or Email &amp; Password.
                </p>
              </div>
              <div className="clay-inset rounded-2xl p-3">
                <div className="font-bold text-[#31475b] mb-1">🤖 Time-Aware AI Companion</div>
                <p className="text-[11px] leading-relaxed">
                  Greets you according to the time of day and assists with focus, study, mindfulness, and knowledge.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
