"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthScheme() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInErrors, setSignInErrors] = useState<{ email?: string; password?: string }>({});

  // Sign Up State
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

  // Sign In Submit
  const handleSignInSubmit = (e: React.FormEvent) => {
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

    if (Object.keys(errors).length === 0) {
      toast.success(`Signed in successfully as ${signInEmail}!`);
    } else {
      toast.error('Please correct the highlighted errors before submitting.');
    }
  };

  // Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
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

    if (Object.keys(errors).length === 0) {
      toast.success(`Account created successfully for ${salutation} ${signUpName}!`);
    } else {
      toast.error('Please correct the highlighted errors before submitting.');
    }
  };

  return (
    <div className="max-w-[460px] mx-auto glass-panel-light-theme rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-black/10 my-6">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Smooth Pill Tab Switcher */}
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

      {/* Tab Panel Content */}
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

            {/* Email Address */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="engineer@restructor.ai"
                className={`w-full px-4 py-3 rounded-2xl bg-white/90 border ${
                  signInErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm`}
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

            {/* Password */}
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
                  className={`w-full px-4 py-3 pr-12 rounded-2xl bg-white/90 border ${
                    signInErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm`}
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full glass-btn-light-primary py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase"
              >
                Sign In
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

            {/* Salutation & Full Name */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                  Title
                </label>
                <select
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value as 'Mr.' | 'Ms.' | 'Mrs.')}
                  className="w-full px-3 py-3 rounded-2xl bg-white/90 border border-slate-300 focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm cursor-pointer"
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
                  className={`w-full px-4 py-3 rounded-2xl bg-white/90 border ${
                    signUpErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm`}
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

            {/* Email Address */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="jane.doe@restructor.ai"
                className={`w-full px-4 py-3 rounded-2xl bg-white/90 border ${
                  signUpErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm`}
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

            {/* Password */}
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
                  className={`w-full px-4 py-3 pr-12 rounded-2xl bg-white/90 border ${
                    signUpErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } focus:outline-none focus:border-blue-600 text-sm font-medium text-slate-900 shadow-sm`}
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

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full glass-btn-light-primary py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase"
              >
                Sign Up
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
