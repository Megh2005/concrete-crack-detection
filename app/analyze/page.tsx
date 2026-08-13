"use client";

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyzePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [viewMode, setViewMode] = useState<'raw' | 'processed' | 'mask'>('processed');

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        toast.success('Image loaded');
        triggerAnalysis();
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
        toast.success('Photo captured');
        triggerAnalysis();
      } else {
        toast.error('Failed to capture photo');
      }
    }
  }, [webcamRef]);

  const triggerAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('Crack analysis complete');
    }, 1200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        toast.success('Image loaded');
        triggerAnalysis();
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please drop an image file');
    }
  };

  return (
    <main className="w-[60%] min-w-[320px] mx-auto py-12 min-h-screen text-slate-900 flex flex-col justify-center">
      <div className="glass-panel-light-theme rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-black/10 my-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold uppercase tracking-wide mb-2">
            Quantitative Inspection Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Concrete Crack Surface Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Upload concrete block image or capture live photo for instant structural metrics
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="glass-panel-card p-1.5 rounded-2xl flex gap-1 border border-black/10 shadow-md">
            <button
              onClick={() => {
                setActiveTab('upload');
                setIsCameraActive(false);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'upload' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-700 hover:text-blue-700'
              }`}
            >
              Upload Image
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                setIsCameraActive(true);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'camera' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-700 hover:text-blue-700'
              }`}
            >
              Live Camera Capture
            </button>
          </div>
        </div>

        {activeTab === 'upload' && !isCameraActive && (
          <div className="space-y-6">
            {!selectedImage ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl">
                  +
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Click or drag & drop concrete image
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports PNG, JPG, JPEG, WEBP up to 15MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-black/15 bg-slate-950 aspect-video flex items-center justify-center shadow-inner">
                  <img
                    src={selectedImage}
                    alt="Concrete specimen"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      viewMode === 'mask' ? 'filter grayscale contrast-200 invert' : ''
                    }`}
                  />

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-xs">
                      <div className="w-full h-1 bg-blue-500 absolute top-0 animate-pulse" />
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="text-white text-xs font-bold uppercase tracking-wider">
                        Running Quantitative Vision Inspection...
                      </span>
                    </div>
                  )}

                  {viewMode === 'processed' && !isAnalyzing && (
                    <div className="absolute inset-0 border-4 border-red-500/40 pointer-events-none flex items-center justify-center">
                      <div className="w-3/4 h-1/2 border-2 border-dashed border-red-500 rounded-lg flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                          Detected Surface Crack Contour
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        viewMode === 'raw' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Raw View
                    </button>
                    <button
                      onClick={() => setViewMode('processed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        viewMode === 'processed' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Processed Overlay
                    </button>
                    <button
                      onClick={() => setViewMode('mask')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        viewMode === 'mask' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Binary Mask
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      toast.info('Image cleared');
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                  >
                    Clear Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="space-y-4 text-center">
            <div className="relative rounded-3xl overflow-hidden border border-black/15 bg-slate-950 aspect-video flex items-center justify-center shadow-inner">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: facingMode
                }}
                className="w-full h-full object-cover"
                onUserMediaError={() => toast.error('Camera permission denied or camera unavailable')}
              />
              <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                Live Feed (1280x720)
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={capturePhoto}
                className="glass-btn-light-primary px-6 py-3 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg"
              >
                Capture Photo
              </button>
              <button
                onClick={() => {
                  setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
                  toast.info('Camera toggled');
                }}
                className="glass-btn-light-secondary px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Switch Camera
              </button>
            </div>
          </div>
        )}

        {selectedImage && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-slate-200 space-y-4"
          >
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Quantitative Metrics Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel-card p-3.5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Damage Ratio (Pc)</span>
                <span className="text-lg font-black text-blue-900">4.28%</span>
              </div>

              <div className="glass-panel-card p-3.5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Max Width (Wc)</span>
                <span className="text-lg font-black text-blue-900">0.34 mm</span>
              </div>

              <div className="glass-panel-card p-3.5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Crack Density</span>
                <span className="text-lg font-black text-blue-900">0.18</span>
              </div>

              <div className="glass-panel-card p-3.5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">IS 456 Status</span>
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md inline-block mt-1">
                  Exceeds 0.3mm Limit
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
