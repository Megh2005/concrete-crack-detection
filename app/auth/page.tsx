import React from 'react';
import AuthScheme from '@/components/AuthScheme';

export default function AuthPage() {
  return (
    <main className="w-[80%] max-w-[1150px] mx-auto py-12 min-h-screen flex flex-col items-center justify-center text-center text-slate-900">
      <section className="w-full">
        <AuthScheme />
      </section>
    </main>
  );
}
