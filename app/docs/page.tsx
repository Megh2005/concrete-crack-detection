"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('sec-1');

  const SECTIONS = [
    { id: 'sec-1', label: '1. Architecture' },
    { id: 'sec-2', label: '2. OpenCV Vision' },
    { id: 'sec-3', label: '3. Deep Learning' },
    { id: 'sec-4', label: '4. Augmentation' },
    { id: 'sec-5', label: '5. Equations' },
    { id: 'sec-6', label: '6. Diagnostics' },
  ];

  return (
    <main className="w-[60%] min-w-[320px] mx-auto py-12 min-h-screen text-slate-900 flex flex-col justify-center">
      <div className="glass-panel-light-theme rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-black/10 my-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold uppercase tracking-wide mb-2">
            Research & Algorithm Documentation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ResTructor AI Technical Specification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Automated Crack Detection, OpenCV Quantification & Deep Learning Formulation
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="glass-panel-card p-1.5 rounded-2xl flex flex-wrap gap-1 border border-black/10 shadow-md justify-center">
            {SECTIONS.map((tab) => {
              const isActive = activeSection === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-slate-700 hover:text-blue-700'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDocPill"
                      className="absolute inset-0 bg-blue-700 rounded-xl shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeSection === 'sec-1' && (
            <motion.div
              key="sec-1"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-left"
            >
              <div className="border-b border-slate-200/80 pb-3">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Section 01</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">System Architecture & Overview</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Conventional concrete inspection depends on manual visual inspection by civil engineers. This approach is subjective, labor-intensive, difficult to standardize, and susceptible to inspector fatigue. The <strong>ResTructor AI</strong> framework establishes a hybrid artificial intelligence and structural engineering architecture that combines convolutional neural networks (CNN), the SHARP model, and OpenCV computer vision.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="block text-xs font-black text-blue-900 uppercase">Deep Learning Pipeline</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    Recognizes hierarchical visual crack patterns under non-uniform illumination and surface roughness.
                  </p>
                </div>

                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="block text-xs font-black text-blue-900 uppercase">OpenCV Metric Extraction</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    Quantifies geometric parameters including crack area, density, distribution, orthogonal width, and affected percentage.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'sec-2' && (
            <motion.div
              key="sec-2"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-left"
            >
              <div className="border-b border-slate-200/80 pb-3">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Section 02</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">OpenCV Computer Vision Pipeline</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    A. Gaussian Noise Filtering Kernel
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    To smooth high-frequency surface noise while retaining sharp structural crack boundaries:
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono shadow-md relative border border-slate-800 my-1">
                    <span className="absolute top-2.5 right-3.5 text-[10px] font-bold text-slate-400">(Eq. 1)</span>
                    <BlockMath math="G(x, y) = \frac{1}{2\pi\sigma^2} \exp\left(-\frac{x^2 + y^2}{2\sigma^2}\right)" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    B. Sobel & Canny Gradient Magnitude
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Spatial intensity gradients along horizontal (<InlineMath math="G_x" />) and vertical (<InlineMath math="G_y" />) axes calculate edge magnitude (<InlineMath math="G" />):
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono shadow-md relative border border-slate-800 my-1">
                    <span className="absolute top-2.5 right-3.5 text-[10px] font-bold text-slate-400">(Eq. 2)</span>
                    <BlockMath math="G = \sqrt{G_x^2 + G_y^2}, \quad \theta = \arctan\left(\frac{G_y}{G_x}\right)" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    C. Morphological Transformations
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Closing (<InlineMath math="\mathbf{A} \bullet \mathbf{B}" />) bridges crack contours, while Opening (<InlineMath math="\mathbf{A} \circ \mathbf{B}" />) suppresses isolated speckles:
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono shadow-md relative border border-slate-800 my-1">
                    <span className="absolute top-2.5 right-3.5 text-[10px] font-bold text-slate-400">(Eq. 3)</span>
                    <BlockMath math="\mathbf{A} \bullet \mathbf{B} = (\mathbf{A} \oplus \mathbf{B}) \ominus \mathbf{B}, \quad \mathbf{A} \circ \mathbf{B} = (\mathbf{A} \ominus \mathbf{B}) \oplus \mathbf{B}" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'sec-3' && (
            <motion.div
              key="sec-3"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-left"
            >
              <div className="border-b border-slate-200/80 pb-3">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Section 03</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">CNN & SHARP Model Formulation</h2>
              </div>

              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Convolutional Neural Networks extract hierarchical visual features directly from input concrete surface patches. For input activation tensor <InlineMath math="X" />, kernel weights <InlineMath math="W" />, and bias vector <InlineMath math="b" />, spatial convolution is calculated as:
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono shadow-md relative border border-slate-800 my-1">
                  <span className="absolute top-2.5 right-3.5 text-[10px] font-bold text-slate-400">(Eq. 4)</span>
                  <BlockMath math="Y_{i,j,k} = f\left( \sum_{m} \sum_{n} \sum_{l} X_{i+m, j+n, l} \cdot W_{m, n, l, k} + b_k \right)" />
                </div>

                <p className="text-xs text-slate-600">
                  where <InlineMath math="f(z) = \max(0, z)" /> represents the Rectified Linear Unit (ReLU) activation function. The SHARP model provides scale-invariant feature extraction.
                </p>
              </div>
            </motion.div>
          )}

          {activeSection === 'sec-4' && (
            <motion.div
              key="sec-4"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-left"
            >
              <div className="border-b border-slate-200/80 pb-3">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Section 04</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Data Augmentation Matrix</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Mathematical transformations applied during training to ensure robust performance across field viewing angles, lighting, and camera noise:
              </p>

              <div className="grid grid-cols-1 gap-3">
                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">1. Affine Rotation & Scale Matrix</span>
                  <div className="p-3 rounded-xl bg-slate-900 text-white font-mono overflow-x-auto text-center">
                    <BlockMath math="\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} s_x \cos\theta & -s_y \sin\theta \\ s_x \sin\theta & s_y \cos\theta \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} + \begin{bmatrix} t_x \\ t_y \end{bmatrix}" />
                  </div>
                </div>

                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">2. Brightness & Contrast Adjustment</span>
                  <div className="p-3 rounded-xl bg-slate-900 text-white font-mono overflow-x-auto text-center">
                    <BlockMath math="I_{\text{aug}}(x, y) = \alpha \cdot I(x, y) + \beta" />
                  </div>
                </div>

                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">3. Gaussian Sensor Noise Injection</span>
                  <div className="p-3 rounded-xl bg-slate-900 text-white font-mono overflow-x-auto text-center">
                    <BlockMath math="I_{\text{noisy}}(x, y) = \min\left(255, \max\left(0, I(x,y) + \mathcal{N}(0, \sigma^2)\right)\right)" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'sec-5' && (
            <motion.div
              key="sec-5"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-left"
            >
              <div className="border-b border-slate-200/80 pb-3">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Section 05</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Quantitative Degradation Equations</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">A. Percentage of Cracked Concrete Surface (<InlineMath math="P_c" />)</h3>
                  <p className="text-xs text-slate-600">
                    The damage ratio comparing detected crack region area (<InlineMath math="A_c" />) against total surface area (<InlineMath math="A_t" />):
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono shadow-md relative border border-slate-800 my-1">
                    <span className="absolute top-2.5 right-3.5 text-[10px] font-bold text-slate-400">(Eq. 5)</span>
                    <BlockMath math="P_c = \frac{A_c}{A_t} \times 100" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">B. IoU & F1-Score Segmentation Overlap</h3>
                  <p className="text-xs text-slate-600">
                    Evaluation comparing predicted mask (<InlineMath math="\hat{M}" />) and ground truth mask (<InlineMath math="M" />):
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono shadow-md relative border border-slate-800 my-1">
                    <span className="absolute top-2.5 right-3.5 text-[10px] font-bold text-slate-400">(Eq. 6)</span>
                    <BlockMath math="\text{IoU} = \frac{|\hat{M} \cap M|}{|\hat{M} \cup M|}, \quad \text{F1} = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'sec-6' && (
            <motion.div
              key="sec-6"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 text-left"
            >
              <div className="border-b border-slate-200/80 pb-3">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">Section 06</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Structural Diagnostics & IS Provisions</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Quantitative visual measurements are interpreted against standard civil engineering mechanisms in accordance with Indian Standard guidelines (IS 456, IS 13920).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">Plastic & Drying Shrinkage</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    Fine map cracking resulting from rapid early-age water evaporation during curing.
                  </p>
                </div>

                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">Rebar Corrosion Spalling</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    Longitudinal cracks parallel to primary reinforcement lines caused by rust expansion.
                  </p>
                </div>

                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">Flexural & Shear Overloading</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    Diagonal 45-degree shear cracking near beam supports or vertical bending cracks.
                  </p>
                </div>

                <div className="glass-panel-card p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">IS 456 Serviceability Limits</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    Limits maximum allowable surface crack width to 0.3 mm for moderate exposure.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        
      </div>
    </main>
  );
}
