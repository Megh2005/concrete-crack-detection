import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="w-[80%] max-w-[1150px] mx-auto py-12 min-h-screen flex flex-col items-center justify-center text-center text-slate-900">
      <section id="overview" className="my-12 flex flex-col items-center justify-center text-center max-w-3xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-normal leading-[1.15] text-slate-900">
          Automated Concrete Crack & Defect Inspection
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-700 max-w-2xl leading-relaxed font-normal">
          Sub-millimeter computer vision and artificial intelligence engineered for real-time structural health monitoring, crack segmentation, and automated damage assessment.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/auth">
            <button className="glass-btn-light-primary px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase">
              Analyze Surface Image
            </button>
          </Link>
          <Link href="/auth">
            <button className="glass-btn-light-secondary px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase">
              Technical Documentation
            </button>
          </Link>
        </div>
      </section>

      <section className="w-full my-8 glass-panel-light-theme rounded-[2.5rem] p-8 md:p-12 text-center shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-normal text-slate-900">
          Access Engineer Portal
        </h3>
        <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-lg font-normal leading-relaxed">
          Field-ready inspection workbench empowering civil and structural engineers with automated AI crack segmentation, image telemetry analysis, and instant compliance reporting.
        </p>
        <Link href="/auth">
          <button className="glass-btn-light-primary px-8 py-3.5 rounded-full text-xs font-bold tracking-wide uppercase mt-8">
            Access Inspector Workspace
          </button>
        </Link>
      </section>
    </main>
  );
}