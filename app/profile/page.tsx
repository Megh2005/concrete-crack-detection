"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();

  const [salutation, setSalutation] = useState('');
  const [name, setName] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSalutation, setEditSalutation] = useState<'Mr.' | 'Ms.' | 'Mrs.'>('Mr.');
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (session?.user) {
      setSalutation((session.user as any).salutation || '');
      setName(session.user.name || '');
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <main className="w-[80%] max-w-[460px] mx-auto py-16 min-h-screen flex items-center justify-center text-center text-slate-900">
        <div className="glass-panel-light-theme rounded-[2.5rem] p-8 shadow-2xl w-full border border-black/10">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-6 bg-slate-200 rounded w-40" />
            <div className="h-4 bg-slate-200 rounded w-56" />
          </div>
        </div>
      </main>
    );
  }

  if (status !== 'authenticated' || !session?.user) {
    return (
      <main className="w-[80%] max-w-[460px] mx-auto py-16 min-h-screen flex items-center justify-center text-center text-slate-900">
        <div className="glass-panel-light-theme rounded-[2.5rem] p-8 shadow-2xl w-full border border-black/10">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-xs text-slate-600 font-medium mb-6">
            Authentication required to view profile.
          </p>
          <Link href="/auth">
            <button className="glass-btn-light-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wide">
              Sign In
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const userEmail = session.user.email || '';

  const handleOpenEdit = () => {
    setEditSalutation((salutation as any) || 'Mr.');
    setEditName(name);
    setNameError('');
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim() || editName.trim().length < 2) {
      setNameError('Full name must be at least 2 characters.');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Updating profile...');

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salutation: editSalutation,
          name: editName.trim(),
        }),
      });

      const data = await response.json();
      setIsSaving(false);

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Update failed', { id: toastId });
      } else {
        setSalutation(data.user.salutation);
        setName(data.user.name);

        await update({
          ...session,
          user: {
            ...session.user,
            name: data.user.name,
            salutation: data.user.salutation,
          },
        });

        setIsEditOpen(false);
        toast.success('Profile updated', { id: toastId });
      }
    } catch {
      setIsSaving(false);
      toast.error('Update failed', { id: toastId });
    }
  };

  return (
    <main className="w-[80%] max-w-[460px] mx-auto py-16 min-h-screen flex items-center justify-center text-center text-slate-900">
      <div className="glass-panel-light-theme rounded-[2.5rem] p-8 shadow-2xl w-full border border-black/10 relative overflow-hidden my-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-normal">
            {salutation} {name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 break-all">
            {userEmail}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="w-full">
              <button className="w-full glass-btn-light-primary py-3.5 rounded-full text-xs font-bold tracking-wide uppercase">
                Go to Dashboard
              </button>
            </Link>

            <button
              onClick={handleOpenEdit}
              className="w-full glass-btn-light-secondary py-3.5 rounded-full text-xs font-bold tracking-wide uppercase"
            >
              Edit Profile
            </button>
          </div>

          <button
            onClick={() => {
              const toastId = toast.loading('Signing out...');
              signOut({ redirect: true, callbackUrl: '/auth' }).then(() => {
                toast.success('Signed out', { id: toastId });
              });
            }}
            className="w-full glass-btn-light-danger py-3.5 rounded-full text-xs font-bold tracking-wide uppercase"
          >
            Sign Out
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="glass-panel-light-theme w-full max-w-[420px] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-black/10 bg-white/95 relative text-left"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-slate-900">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                  className="p-1 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Title
                    </label>
                    <select
                      value={editSalutation}
                      onChange={(e) => setEditSalutation(e.target.value as 'Mr.' | 'Ms.' | 'Mrs.')}
                      disabled={isSaving}
                      className="w-full px-3 py-2.5 rounded-2xl bg-white border border-slate-300 focus:outline-none focus:border-blue-600 text-xs font-medium text-slate-900 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={isSaving}
                      className={`w-full px-4 py-2.5 rounded-2xl bg-white border ${
                        nameError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                      } focus:outline-none focus:border-blue-600 text-xs font-medium text-slate-900 shadow-sm disabled:opacity-50`}
                    />
                    {nameError && (
                      <p className="text-[11px] font-bold text-red-600 mt-1">{nameError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled={true}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500 shadow-sm cursor-not-allowed"
                  />
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isSaving}
                    className="flex-1 glass-btn-light-secondary py-3 rounded-full text-xs font-bold tracking-wide uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 glass-btn-light-primary py-3 rounded-full text-xs font-bold tracking-wide uppercase disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
