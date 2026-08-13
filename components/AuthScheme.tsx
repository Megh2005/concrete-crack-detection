"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, LogOut, UserCheck } from 'lucide-react';
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

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      toast.error('Please resolve the highlighted errors.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Authenticating credentials...');

    try {
      const res = await signIn('credentials', {
        email: signInEmail.trim(),
        password: signInPassword,
        redirect: false,
      });

      setIsSubmitting(false);

      if (res?.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success('Signed in successfully!', { id: toastId });
        setSignInEmail('');
        setSignInPassword('');
      }
    } catch {
      setIsSubmitting(false);
      toast.error('An unexpected error occurred during authentication.', { id: toastId });
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
      toast.error('Please resolve the highlighted errors.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Registering account...');

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
        toast.error(data.error || 'Failed to register account.', { id: toastId });
      } else {
        toast.success('Account created successfully!', { id: toastId });

        await signIn('credentials', {
          email: signUpEmail.trim(),
          password: signUpPassword,
          redirect: false,
        });

        setSignUpName('');
        setSignUpEmail('');
        setSignUpPassword('');
      }
    } catch {
      setIsSubmitting(false);
      toast.error('An error occurred while creating your account.', { id: toastId });
    }
  };

  if (status === 'authenticated' && session?.user) {
    return (
      <div className="max-w-[460px] mx-auto glass-panel-light-theme rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-black/10 my-6 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center shadow-md">
            <UserCheck size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-normal mb-1">
          Welcome, {(session.user as any).salutation || ''} {session.user.name}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mb-6">
          {session.user.email}
        </p>

        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs font-medium text-slate-700 mb-6">
          Authenticated Session Active (Expires in 24 Hours)
        </div>

        <button
          onClick={() => {
            const toastId = toast.loading('Signing out...');
            signOut({ redirect: false }).then(() => {
              toast.success('Signed out successfully.', { id: toastId });
            });
          }}
          className="w-full glass-btn-light-secondary py-3.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Sign Out of Workspace
        </button>
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
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="jane.doe@restructor.ai"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 rounded-2xl bg-white/90 border ${
                  signUpErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm disabled:opacity-50`}
              />
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

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Password (8-12 Characters)
              </label>
              <div className="relative">
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="8-12 characters"
                  minLength={8}
                  maxLength={12}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 pr-12 rounded-2xl bg-white/90 border ${
                    signUpErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 p-1"
                  aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
                disabled={isSubmitting}
                className="w-full glass-btn-light-primary py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase disabled:opacity-50"
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
