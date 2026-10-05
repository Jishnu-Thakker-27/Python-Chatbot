import React, { useState } from 'react';
import { ClayAvatar } from './ClayAvatar';
import { audioEngine } from '../utils/audioEngine';
import { X, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';

interface SignInScreenProps {
  onSignInSuccess: (email: string) => void;
  onNavigateHelp?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSignInSuccess,
}) => {
  const [email, setEmail] = useState('aryan@musicverse.io');
  const [password, setPassword] = useState('TactileAether2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('+1 (555) 389-2041');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.playHapticClick(480, 0.08);
    setIsSubmitting(true);
    setTimeout(() => {
      audioEngine.playChime(528, 1.2);
      setIsSubmitting(false);
      onSignInSuccess(email || 'aryan@musicverse.io');
    }, 450);
  };

  const handleGoogleAuth = () => {
    audioEngine.playHapticClick(400);
    setShowGoogleModal(true);
  };

  const handlePhoneAuth = () => {
    audioEngine.playHapticClick(380);
    setShowPhoneModal(true);
  };

  const handleQuickDemoFill = (demoEmail: string) => {
    audioEngine.playHapticClick(350);
    setEmail(demoEmail);
    setPassword('TactileAether2026!');
  };

  return (
    <div className="w-full flex flex-col justify-between px-6 pt-6 pb-6 relative" data-purpose="mobile-clay-container">
      {/* Top Status Bar & App Navigation Header */}
      <header className="w-full flex items-center justify-between mb-5" data-purpose="top-navigation">
        {/* Back / Close Button */}
        <button
          type="button"
          onClick={() => audioEngine.playHapticClick(260)}
          aria-label="Go back"
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
        >
          <svg
            className="w-5 h-5 stroke-[2.5]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

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
          className="w-11 h-11 rounded-2xl clay-surface-sm flex items-center justify-center text-[#4a637a] active:scale-95 transition-transform cursor-pointer"
        >
          <svg
            className="w-5 h-5 stroke-[2.2]"
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
      <section className="clay-surface rounded-3xl p-5 mb-5 relative overflow-hidden" data-purpose="welcome-hero-banner">
        {/* Embossed Highlight Glow Background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          {/* 3D Clay Character / Avatar */}
          <ClayAvatar size="md" isOnline={true} isAnimated={true} />

          {/* Greeting Text */}
          <div className="flex-1 pr-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full clay-tag mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a97a8]" />
              <span className="text-[10px] font-bold text-[#355b66] uppercase tracking-wide">Sound &amp; Mind</span>
            </div>
            <h1 className="text-xl font-extrabold text-debossed leading-tight">Welcome back!</h1>
            <p className="text-xs text-subtle-debossed font-medium mt-0.5">Enter your tactile space to begin.</p>
          </div>
        </div>
      </section>
      {/* END: ClayHeroWelcomeCard */}

      {/* BEGIN: QuickAuthPills */}
      <section className="space-y-3.5 mb-5" data-purpose="primary-auth-actions">
        {/* Continue with Google Button */}
        <button
          onClick={handleGoogleAuth}
          className="w-full py-3.5 px-4 rounded-2xl clay-card-pill flex items-center justify-between group cursor-pointer"
          type="button"
        >
          <div className="flex items-center gap-3.5">
            {/* Google Neumorphic Badge */}
            <div className="w-10 h-10 rounded-xl clay-badge flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="text-sm font-bold text-[#3d5368] text-debossed group-hover:text-[#283846] transition-colors">
              Continue with Google
            </span>
          </div>
          {/* Right Arrow Inset Indicator */}
          <div className="w-7 h-7 rounded-lg clay-badge flex items-center justify-center text-[#5c7287]">
            <svg
              className="w-3.5 h-3.5 stroke-[2.5]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* Continue with Phone Button */}
        <button
          onClick={handlePhoneAuth}
          className="w-full py-3.5 px-4 rounded-2xl clay-card-pill flex items-center justify-between group cursor-pointer"
          type="button"
        >
          <div className="flex items-center gap-3.5">
            {/* Phone Tactile Badge */}
            <div className="w-10 h-10 rounded-xl clay-badge flex items-center justify-center text-[#4c8496]">
              <svg className="w-5 h-5 fill-current stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#3d5368] text-debossed group-hover:text-[#283846] transition-colors">
              Continue with Phone
            </span>
          </div>
          {/* Right Arrow Inset Indicator */}
          <div className="w-7 h-7 rounded-lg clay-badge flex items-center justify-center text-[#5c7287]">
            <svg
              className="w-3.5 h-3.5 stroke-[2.5]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </section>
      {/* END: QuickAuthPills */}

      {/* BEGIN: TactileDivider */}
      <div className="flex items-center my-2.5 gap-3" data-purpose="visual-divider">
        <div className="h-0.5 flex-1 bg-[#a9b9c7] shadow-[0_1px_0_#dbe6f0]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#63798d] text-subtle-debossed px-1">
          or email sign in
        </span>
        <div className="h-0.5 flex-1 bg-[#a9b9c7] shadow-[0_1px_0_#dbe6f0]" />
      </div>
      {/* END: TactileDivider */}

      {/* BEGIN: EmailLoginForm */}
      <form className="space-y-3.5 my-1.5" data-purpose="email-input-section" onSubmit={handleSignIn}>
        {/* Email Inset Field */}
        <div className="space-y-1.5">
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
              placeholder="aryan@musicverse.io"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Inset Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="block text-xs font-bold text-[#42596e] text-subtle-debossed tracking-wide" htmlFor="password">
              Password
            </label>
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
              placeholder="••••••••••••"
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

        {/* Tactile Clay Submit Pill Button */}
        <button
          className="w-full py-4 px-6 rounded-2xl clay-button-cyan font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
          data-purpose="sign-in-button"
          type="submit"
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? 'Entering Space...' : 'Sign in to Dashboard'}</span>
          {/* Embossed play/forward chevron */}
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
      {/* END: EmailLoginForm */}

      {/* BEGIN: QuickStatsClayCard */}
      <div className="my-3.5 px-4 py-3 rounded-2xl clay-surface-sm flex items-center justify-around text-center" data-purpose="clay-micro-stat">
        <div>
          <span className="block text-base font-extrabold text-[#3a5266] text-debossed">1.2M+</span>
          <span className="text-[10px] font-semibold text-[#6d8498] uppercase">Active Listeners</span>
        </div>
        <div className="w-px h-7 bg-[#aab9c7] shadow-[1px_0_0_#dbe6f0]" />
        <div>
          <span className="block text-base font-extrabold text-[#3a5266] text-debossed">4.9 / 5</span>
          <span className="text-[10px] font-semibold text-[#6d8498] uppercase">App Rating</span>
        </div>
        <div className="w-px h-7 bg-[#aab9c7] shadow-[1px_0_0_#dbe6f0]" />
        <div>
          <span className="block text-base font-extrabold text-[#3a5266] text-debossed">Spatial</span>
          <span className="text-[10px] font-semibold text-[#6d8498] uppercase">Audio Ready</span>
        </div>
      </div>
      {/* END: QuickStatsClayCard */}

      {/* BEGIN: FooterLinks */}
      <footer className="mt-1 text-center" data-purpose="terms-and-home-indicator">
        <p className="text-[11px] font-medium text-[#6c8195] text-subtle-debossed leading-relaxed px-4">
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
          .
        </p>
        {/* Soft iOS Home Indicator Bar */}
        <div className="w-32 h-1.5 rounded-full clay-inset mx-auto mt-4" />
      </footer>
      {/* END: FooterLinks */}

      {/* Google OAuth Modal Simulation */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80]"
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
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">Sign in with Google</h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-5">
              Select an account to access your Aether Space audio profile
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  audioEngine.playChime(440);
                  setShowGoogleModal(false);
                  onSignInSuccess('aryan.google@musicverse.io');
                }}
                className="w-full p-3 rounded-2xl clay-card-pill flex items-center gap-3 text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#5fa5b8] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  A
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-[#32485c]">Aryan Vance</div>
                  <div className="text-[11px] text-[#6d8396] truncate">aryan@musicverse.io</div>
                </div>
                <span className="text-[10px] font-bold text-[#449382] uppercase">Signed In</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playChime(480);
                  setShowGoogleModal(false);
                  onSignInSuccess('jishnu.creator@soundmind.io');
                }}
                className="w-full p-3 rounded-2xl clay-card-pill flex items-center gap-3 text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#6a7f92] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  J
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-[#32485c]">Jishnu Mindscape</div>
                  <div className="text-[11px] text-[#6d8396] truncate">jishnu@aetherspace.io</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Auth Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative">
            <button
              onClick={() => {
                setShowPhoneModal(false);
                setOtpSent(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl clay-badge mx-auto flex items-center justify-center text-[#4c8496] mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">
              {otpSent ? 'Enter Security Code' : 'Continue with Phone'}
            </h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-4">
              {otpSent
                ? `6-digit tactile code sent to ${phoneInput}`
                : 'Enter your phone number to receive a one-touch pass'}
            </p>

            {!otpSent ? (
              <div className="space-y-4">
                <div className="clay-inset rounded-2xl p-3.5 border border-white/20">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-transparent border-none text-sm font-semibold text-[#304557] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playHapticClick(450);
                    setOtpSent(true);
                  }}
                  className="w-full py-3.5 rounded-2xl clay-button-cyan font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send Verification SMS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="clay-inset rounded-2xl p-3.5 text-center border border-white/20">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full bg-transparent border-none text-center tracking-[0.5em] text-lg font-bold text-[#304557] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playChime(528);
                    setShowPhoneModal(false);
                    onSignInSuccess(phoneInput);
                  }}
                  className="w-full py-3.5 rounded-2xl clay-button-cyan font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  Verify &amp; Enter Space
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotEmailSent(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">Reset Password</h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-4">
              Enter your email and we will send you a tactile login magic link.
            </p>

            {forgotEmailSent ? (
              <div className="clay-surface-sm rounded-2xl p-4 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-[#4bb390] mx-auto" />
                <p className="text-xs font-bold text-[#344d61]">Magic Link Dispatched!</p>
                <p className="text-[11px] text-[#6d8396]">Check your inbox at {email}</p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmailSent(false);
                  }}
                  className="mt-3 w-full py-2.5 rounded-xl clay-button-cyan text-xs font-bold"
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
                    placeholder="aryan@musicverse.io"
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

      {/* Help / About Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-surface rounded-3xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full clay-surface-sm flex items-center justify-center text-[#556c80]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl clay-badge mx-auto flex items-center justify-center text-[#4c8496] mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-center font-extrabold text-[#32485c] text-debossed text-lg">About Aether Space</h3>
            <p className="text-xs text-center text-[#687f94] mt-1 mb-4">
              Tactile Sound &amp; Mind Spatial Audio Platform
            </p>

            <div className="space-y-3 text-xs text-[#4d6377]">
              <div className="clay-inset rounded-2xl p-3">
                <div className="font-bold text-[#31475b] mb-1">🎧 Spatial Soundscapes</div>
                <p className="text-[11px] leading-relaxed">
                  Real-time synthesized harmonic ambient tones, binaural 432Hz theta waves, and pink noise soundscapes.
                </p>
              </div>
              <div className="clay-inset rounded-2xl p-3">
                <div className="font-bold text-[#31475b] mb-1">🎛️ Tactile Neumorphism</div>
                <p className="text-[11px] leading-relaxed">
                  Organic debossed clay surfaces with Web Audio acoustic feedback for every button and slider interaction.
                </p>
              </div>
              <div className="clay-inset rounded-2xl p-3">
                <div className="font-bold text-[#31475b] mb-1">⚡ Quick Demo Login</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      handleQuickDemoFill('aryan@musicverse.io');
                      setShowHelpModal(false);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg clay-card-pill text-[10px] font-bold text-[#35536b]"
                  >
                    Load Aryan
                  </button>
                  <button
                    onClick={() => {
                      handleQuickDemoFill('elena@mindflow.fm');
                      setShowHelpModal(false);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg clay-card-pill text-[10px] font-bold text-[#35536b]"
                  >
                    Load Elena
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
