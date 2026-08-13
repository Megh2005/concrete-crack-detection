"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, LogOut, UserCheck, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthScheme() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInErrors, setSignInErrors] = useState<{ email?: string; password?: string }>({});

  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.' | 'Mrs.'>('Mr.');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState<{
    salutation?: string;
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};

    if (!signInEmail.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(signInEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!signInPassword) {
      errors.password = 'Password is required.';
    }

    setSignInErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Fix form errors');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Signing in...');

    try {
      const res = await signIn('credentials', {
        email: signInEmail.trim(),
        password: signInPassword,
        redirect: false,
      });

      setIsSubmitting(false);

      if (res?.error) {
        toast.error(res.error || 'Sign in failed', { id: toastId });
      } else {
        toast.success('Signed in', { id: toastId });
        setSignInEmail('');
        setSignInPassword('');
      }
    } catch {
      setIsSubmitting(false);
      toast.error('Sign in failed', { id: toastId });
    }
  };

  const handleSendOtp = async () => {
    if (!emailRegex.test(signUpEmail.trim())) {
      toast.error('Enter valid email');
      return;
    }

    setIsSendingOtp(true);
    const toastId = toast.loading('Sending OTP...');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: signUpEmail.trim(),
          from: 'ResTructor AI Team',
          subject: 'ResTructor AI Verification Code',
          text: `Your ResTructor AI email verification code is: ${code}`,
          html: `<p>Your ResTructor AI email verification code is:</p><h2>${code}</h2>`,
        }),
      });

      const data = await response.json();
      setIsSendingOtp(false);

      if (response.ok && data.success) {
        setIsOtpSent(true);
        setOtpError('');
        toast.success('OTP sent to email', { id: toastId });
      } else {
        console.error('OTP send error details:', data);
        toast.error(data.error || 'Failed to send OTP', { id: toastId });
      }
    } catch (err) {
      console.error('OTP fetch exception:', err);
      setIsSendingOtp(false);
      toast.error('OTP delivery failed', { id: toastId });
    }
  };

  const handleValidateOtp = () => {
    if (!enteredOtp || enteredOtp.length !== 6) {
      setOtpError('Please enter 6-digit code');
      return;
    }

    if (enteredOtp === generatedOtp) {
      setIsEmailVerified(true);
      setOtpError('');
      toast.success('Email verified');
    } else {
      setOtpError('Incorrect code');
      toast.error('Invalid OTP');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailVerified) {
      toast.error('Verify email first');
      return;
    }

    const errors: {
      salutation?: string;
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (!salutation) {
      errors.salutation = 'Please select a salutation.';
    }

    if (!signUpName.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!signUpEmail.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(signUpEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!signUpPassword) {
      errors.password = 'Password is required.';
    } else if (signUpPassword.length < 8 || signUpPassword.length > 12) {
      errors.password = 'Password must be strictly 8 to 12 characters long.';
    }

    setSignUpErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Fix form errors');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating account...');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salutation,
          name: signUpName.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
        }),
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Sign up failed', { id: toastId });
      } else {
        toast.success('Account created', { id: toastId });

        await signIn('credentials', {
          email: signUpEmail.trim(),
          password: signUpPassword,
          redirect: false,
        });

        setSignUpName('');
        setSignUpEmail('');
        setSignUpPassword('');
        setIsEmailVerified(false);
        setIsOtpSent(false);
        setGeneratedOtp('');
        setEnteredOtp('');
      }
    } catch {
      setIsSubmitting(false);
      toast.error('Sign up failed', { id: toastId });
    }
  };

  if (status === 'authenticated' && session?.user) {
    return (
      <div className="max-w-[460px] mx-auto glass-panel-light-theme rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-black/10 my-6 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shadow-md">
            <UserCheck size={32} />
          </div>
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide">
          You are Authenticated
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-normal mb-1">
          {(session.user as any).salutation || ''} {session.user.name}
        </h2>

        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 text-xs font-medium text-slate-700 mb-6 shadow-sm">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
            Authenticated Email Address
          </span>
          <span className="text-sm font-bold text-slate-900 break-all">
            {session.user.email}
          </span>
        </div>

        <div className="space-y-3">
          <Link href="/profile">
            <button className="w-full glass-btn-light-primary py-3.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2">
              <UserIcon size={16} />
              View Full Profile Page
            </button>
          </Link>

          <button
            onClick={() => {
              const toastId = toast.loading('Signing out...');
              signOut({ redirect: false }).then(() => {
                toast.success('Signed out', { id: toastId });
              });
            }}
            className="w-full glass-btn-light-danger py-3.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign Out of Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[460px] mx-auto glass-panel-light-theme rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-black/10 my-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-center mb-6">
        <div className="glass-panel-card p-1.5 rounded-full flex gap-1 border border-black/10 shadow-md relative">
          <button
            onClick={() => setActiveTab('signin')}
            className={`relative z-10 px-7 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors duration-200 ${
              activeTab === 'signin' ? 'text-white' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            {activeTab === 'signin' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full shadow-md -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            Sign In
          </button>

          <button
            onClick={() => setActiveTab('signup')}
            className={`relative z-10 px-7 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors duration-200 ${
              activeTab === 'signup' ? 'text-white' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            {activeTab === 'signup' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full shadow-md -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            Sign Up
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'signin' ? (
          <motion.form
            key="signin"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSignInSubmit}
            className="space-y-5 text-left"
            noValidate
          >
            <div className="text-center mb-5">
              <h2 className="text-2xl font-black text-slate-900 tracking-normal">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Enter your credentials to access ResTructor AI
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="engineer@restructor.ai"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 rounded-2xl bg-white/90 border ${
                  signInErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm disabled:opacity-50`}
              />
              {signInErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-red-600 mt-1"
                >
                  {signInErrors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 pr-12 rounded-2xl bg-white/90 border ${
                    signInErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 p-1"
                  aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {signInErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-red-600 mt-1"
                >
                  {signInErrors.password}
                </motion.p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full glass-btn-light-primary py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="signup"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSignUpSubmit}
            className="space-y-4 text-left"
            noValidate
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-normal">
                Sign Up
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Enter your details to create a ResTructor AI account
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  Title
                </label>
                <select
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value as 'Mr.' | 'Ms.' | 'Mrs.')}
                  disabled={isSubmitting}
                  className="w-full px-3 py-3 rounded-2xl bg-white/90 border border-slate-300 focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Jane Doe"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/90 border ${
                    signUpErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm disabled:opacity-50`}
                />
                {signUpErrors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-red-600 mt-1"
                  >
                    {signUpErrors.name}
                  </motion.p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => {
                    setSignUpEmail(e.target.value);
                    setIsOtpSent(false);
                    setIsEmailVerified(false);
                    setEnteredOtp('');
                    setOtpError('');
                  }}
                  placeholder="jane.doe@restructor.ai"
                  disabled={isSubmitting || isOtpSent || isEmailVerified}
                  className={`w-full px-4 py-3 ${
                    isEmailVerified ? 'pr-24' : (!isOtpSent && emailRegex.test(signUpEmail.trim()) ? 'pr-24' : 'pr-4')
                  } rounded-2xl bg-white/90 border ${
                    signUpErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm disabled:opacity-60`}
                />
                {!isEmailVerified && !isOtpSent && emailRegex.test(signUpEmail.trim()) && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-blue-700 text-white text-xs font-bold uppercase tracking-wide hover:bg-blue-800 transition-all disabled:opacity-50"
                  >
                    {isSendingOtp ? 'Sending...' : 'Verify'}
                  </button>
                )}
                {isEmailVerified && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl">
                    Verified
                  </span>
                )}
              </div>
              {signUpErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-red-600 mt-1"
                >
                  {signUpErrors.email}
                </motion.p>
              )}
            </div>

            {isOtpSent && !isEmailVerified && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5 pt-1"
              >
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                  Enter 6-Digit Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-300 focus:outline-none focus:border-blue-600 text-sm font-bold text-slate-900 tracking-widest text-center shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleValidateOtp}
                    className="px-5 py-2.5 rounded-2xl bg-blue-700 text-white text-xs font-bold uppercase tracking-wide hover:bg-blue-800 transition-all"
                  >
                    Validate
                  </button>
                </div>
                {otpError && (
                  <p className="text-xs font-bold text-red-600">{otpError}</p>
                )}
              </motion.div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Password (8-12 Characters)
              </label>
              <div className="relative">
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder={isEmailVerified ? "8-12 characters" : "Verify email first to set password"}
                  minLength={8}
                  maxLength={12}
                  disabled={!isEmailVerified || isSubmitting}
                  className={`w-full px-4 py-3 pr-12 rounded-2xl bg-white/90 border ${
                    signUpErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  disabled={!isEmailVerified || isSubmitting}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isEmailVerified && (
                <p className="text-[11px] font-semibold text-amber-700 mt-1">
                  Email verification required before setting password
                </p>
              )}
              {signUpErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-red-600 mt-1"
                >
                  {signUpErrors.password}
                </motion.p>
              )}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={!isEmailVerified || isSubmitting}
                className="w-full glass-btn-light-primary py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {isSubmitting ? 'Registering...' : 'Sign Up'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
