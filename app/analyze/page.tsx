"use client";

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface AnalysisResult {
  processedImage: string;
  binaryMask: string;
  grayscaleImage?: string;
  hasCrack: boolean;
  deepCrackCount: number;
  shallowCrackCount: number;
  crackAreaRatio: string;
  maxCrackWidth: string;
  crackDensity: string;
  crackSeverity: string;
  faultRegime: string;
  confidenceScore?: string;
  disclaimer?: string;
  detectedComponentsCount?: number;
}

export default function AnalyzePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [viewMode, setViewMode] = useState<'processed' | 'raw' | 'mask' | 'gray'>('processed');

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageWithSharp = async (base64Image: string) => {
    setIsAnalyzing(true);
    const inspectionPromise = fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to process image');
      return data;
    });

    toast.promise(inspectionPromise, {
      loading: 'Executing Sharp image analysis pipeline...',
      success: (data: any) => data.hasCrack ? 'Analysis complete — Crack identified' : 'Analysis complete — Intact specimen',
      error: (err: any) => err?.message || 'Analysis failed',
    });

    try {
      const data = await inspectionPromise;
      setAnalysisResult(data);
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        processImageWithSharp(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSelectedImage(imageSrc);
        setIsCameraActive(false);
        processImageWithSharp(imageSrc);
      } else {
        toast.error('Failed to capture photo');
      }
    }
  }, [webcamRef]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        processImageWithSharp(result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please drop an image file');
    }
  };

  return (
    <main className="w-[60%] min-w-[320px] mx-auto py-12 min-h-screen text-slate-900 flex flex-col justify-center">
      <div className="glass-panel-light-theme rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-black/10 my-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-800 text-[11px] font-bold uppercase tracking-wide mb-1.5">
            Sharp Multi-Representation Computer Vision Pipeline
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Concrete Crack Surface Analysis
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Real-time intensity-graded crack detection & Fault Regime Identification
          </p>
        </div>

        <div className="flex justify-center mb-5">
          <div className="glass-panel-card p-1 rounded-xl flex gap-1 border border-black/10 shadow-sm">
            <button
              onClick={() => {
                setActiveTab('upload');
                setIsCameraActive(false);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'upload' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-700 hover:text-blue-700'
              }`}
            >
              Upload Image
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                setIsCameraActive(true);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === 'camera' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-700 hover:text-blue-700'
              }`}
            >
              Live Camera Capture
            </button>
          </div>
        </div>

        {activeTab === 'upload' && !isCameraActive && (
          <div className="space-y-4">
            {!selectedImage ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="max-w-[480px] h-[220px] mx-auto border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                  +
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Click or drag & drop concrete image
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports PNG, JPG, JPEG, WEBP up to 15MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-w-[480px] h-[240px] mx-auto relative rounded-3xl overflow-hidden border border-black/15 bg-slate-950 flex items-center justify-center shadow-inner">
                  <img
                    src={
                      viewMode === 'raw'
                        ? selectedImage
                        : viewMode === 'mask' && analysisResult?.binaryMask
                        ? analysisResult.binaryMask
                        : viewMode === 'gray' && analysisResult?.grayscaleImage
                        ? analysisResult.grayscaleImage
                        : analysisResult?.processedImage || selectedImage
                    }
                    alt="Concrete specimen analysis"
                    className="w-full h-full object-contain"
                  />

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center space-y-3 text-center p-4">
                      <div className="w-full h-0.5 bg-blue-600 animate-pulse absolute top-0 left-0" />
                      <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                      <div className="space-y-0.5">
                        <p className="text-white text-xs font-bold uppercase tracking-wider">
                          Processing Concrete Image...
                        </p>
                        <p className="text-slate-400 text-[11px] font-medium">
                          Executing Sharp Computer Vision Pipeline
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="max-w-[480px] mx-auto flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setViewMode('processed')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        viewMode === 'processed' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Processed Overlay
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        viewMode === 'raw' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Raw View
                    </button>
                    <button
                      onClick={() => setViewMode('mask')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        viewMode === 'mask' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Binary Mask
                    </button>
                    {analysisResult?.grayscaleImage && (
                      <button
                        onClick={() => setViewMode('gray')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          viewMode === 'gray' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Grayscale
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                      toast.info('Image cleared');
                    }}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 underline"
                  >
                    Clear Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="space-y-3 text-center">
            <div className="max-w-[480px] h-[240px] mx-auto relative rounded-3xl overflow-hidden border border-black/15 bg-slate-950 flex items-center justify-center shadow-inner">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 800,
                  height: 600,
                  facingMode: facingMode
                }}
                className="w-full h-full object-cover"
                onUserMediaError={() => toast.error('Camera permission denied or camera unavailable')}
              />
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Live Camera
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={capturePhoto}
                className="glass-btn-light-primary px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md"
              >
                Capture Photo
              </button>
              <button
                onClick={() => {
                  setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
                  toast.info('Camera toggled');
                }}
                className="glass-btn-light-secondary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Switch Camera
              </button>
            </div>
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Quantitative Crack Inspection Analysis
              </h3>

              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                  Severe Crack
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Moderate Crack
                </span>
                <span className="flex items-center gap-1 text-cyan-600">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                  Shallow Crack
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Intact Space
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="glass-panel-card p-3 rounded-xl border border-slate-200 text-center flex flex-col justify-center items-center">
                <span className="block text-[9px] font-bold text-slate-500 uppercase">Crack Density (Dc)</span>
                <span className="text-base font-black text-blue-900 mt-0.5">{analysisResult.crackDensity}</span>
              </div>

              <div className="glass-panel-card p-3 rounded-xl border border-slate-200 text-center flex flex-col justify-center items-center">
                <span className="block text-[9px] font-bold text-slate-500 uppercase">Damage Ratio (Pc)</span>
                <span className="text-base font-black text-blue-900 mt-0.5">{analysisResult.crackAreaRatio}</span>
              </div>

              <div className="glass-panel-card p-3 rounded-xl border border-slate-200 text-center flex flex-col justify-center items-center">
                <span className="block text-[9px] font-bold text-slate-500 uppercase">Max Width (Wc)</span>
                <span className="text-base font-black text-blue-900 mt-0.5">{analysisResult.maxCrackWidth}</span>
              </div>
            </div>

            <div className="glass-panel-card p-3 rounded-xl border border-slate-200 space-y-0.5 text-left">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-black text-blue-900 uppercase tracking-wide">
                  Identified Structural Fault Regime
                </span>
                {analysisResult.confidenceScore && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Confidence: {analysisResult.confidenceScore}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-800">
                {analysisResult.faultRegime}
              </p>
              <p className="text-[10px] text-slate-600">
                {analysisResult.hasCrack
                  ? `Sharp pixel variance analysis: ${analysisResult.detectedComponentsCount || 1} connected crack component(s) identified.`
                  : 'No structural surface cracking identified across analyzed image pixels.'}
              </p>
              {analysisResult.disclaimer && (
                <p className="text-[9px] text-slate-500 italic mt-1 border-t border-slate-200/60 pt-1">
                  * {analysisResult.disclaimer}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
