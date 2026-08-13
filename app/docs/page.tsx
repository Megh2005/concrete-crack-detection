import React from 'react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <main className="w-[80%] max-w-[1150px] mx-auto py-12 min-h-screen text-slate-900">
      <section className="glass-panel-light-theme rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-black/10 my-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wide">
          Technical Documentation
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
          ResTructor AI Architecture & System API
        </h1>

        <p className="text-sm sm:text-base text-slate-700 font-normal leading-relaxed max-w-3xl mb-8">
          Welcome to the official technical documentation for ResTructor AI. This platform provides real-time sub-millimeter computer vision, automated crack width measurement, structural compliance reporting, and secured REST APIs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
          <div className="glass-panel-card p-6 rounded-2xl border border-black/10">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Automated Crack Segmentation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Deep convolutional neural network models trained for high-precision surface defect isolation and pixel-level crack width computation.
            </p>
          </div>

          <div className="glass-panel-card p-6 rounded-2xl border border-black/10">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Secured Inspection Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Protected GraphQL and REST endpoints backed by NextAuth JWT sessions and MongoDB infrastructure.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/auth">
            <button className="glass-btn-light-primary px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase">
              Access ResTructor AI Workspace
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
