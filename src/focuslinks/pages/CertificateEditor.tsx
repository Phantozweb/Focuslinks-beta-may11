'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crosshair, Save, RotateCcw, Type, Palette, AlignCenter,
  AlignLeft, AlignRight, Download, Move, Info, Check, Loader2,
  MousePointerClick, ChevronDown, ChevronUp
} from 'lucide-react';

interface NamePosition {
  x: number;
  y: number;
}

interface CertificateConfig {
  namePosition: NamePosition;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  textAlign: 'center' | 'left' | 'right';
  templateImage: string;
  nameText?: string;
}

const GITHUB_RAW_TEMPLATE_URL = 'https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Certificate/certificate-template.png';
const FALLBACK_TEMPLATE_URL = '/certificate-template.png';

const DEFAULT_CONFIG: CertificateConfig = {
  namePosition: { x: 50, y: 50 },
  fontSize: 36,
  fontFamily: 'Georgia, serif',
  fontColor: '#1e293b',
  textAlign: 'center',
  templateImage: GITHUB_RAW_TEMPLATE_URL,
  nameText: 'Dr. John Smith',
};

const FONT_OPTIONS = [
  { label: 'Serif (Georgia)', value: 'Georgia, serif' },
  { label: 'Sans-serif (Inter)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Monospace', value: '"Courier New", monospace' },
  { label: 'Cursive', value: '"Brush Script MT", cursive' },
  { label: 'Elegant (Palatino)', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
];

export default function CertificateEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG);
  const [savedSha, setSavedSha] = useState<string | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [showControls, setShowControls] = useState(true);
  const [crosshairPos, setCrosshairPos] = useState<NamePosition | null>(null);

  // Load existing config from GitHub
  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const res = await fetch('/api/certificate-config');
        const data = await res.json();
        if (!cancelled && data.success && data.config) {
          setConfig(prev => ({ ...DEFAULT_CONFIG, ...data.config }));
          if (data.sha) setSavedSha(data.sha);
        }
      } catch (err) {
        console.error('Failed to load config:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  // Handle click on the certificate to set name position
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setConfig(prev => ({ ...prev, namePosition: { x, y } }));
    setCrosshairPos({ x, y });
  }, []);

  // Handle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setConfig(prev => ({ ...prev, namePosition: { x, y } }));
    setCrosshairPos({ x, y });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Save to GitHub
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/certificate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, sha: savedSha }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (data.sha) setSavedSha(data.sha);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to save');
      }
    } catch {
      setSaveError('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setCrosshairPos(null);
  };

  // Pixel coordinates (based on template image natural size)
  const pixelX = Math.round((config.namePosition.x / 100) * imageNaturalSize.width);
  const pixelY = Math.round((config.namePosition.y / 100) * imageNaturalSize.height);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="w-10 h-10 border-4 border-teal-100 dark:border-teal-900 rounded-full" />
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <p className="text-sm text-gray-500 animate-pulse">Loading certificate editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-6 px-4 md:py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Certificate Config Editor
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click on the certificate to position the name text. Save config to GitHub.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Certificate Canvas Area */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MousePointerClick className="w-4 h-4" />
                <span>Click to place name &bull; Drag to adjust</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                  X: {config.namePosition.x.toFixed(1)}% &nbsp; Y: {config.namePosition.y.toFixed(1)}%
                </span>
                {imageNaturalSize.width > 0 && (
                  <span className="text-xs font-mono bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded text-teal-700 dark:text-teal-400">
                    px({pixelX}, {pixelY})
                  </span>
                )}
              </div>
            </div>

            {/* Certificate Image with overlay */}
            <div
              ref={canvasRef}
              className="relative cursor-crosshair select-none overflow-hidden"
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Certificate Template Image — using next/image goes through /_next/image which bypasses SPA rewrite */}
              <Image
                src={GITHUB_RAW_TEMPLATE_URL}
                alt="Certificate Template"
                width={1536}
                height={1024}
                className="w-full h-auto block"
                draggable={false}
                unoptimized
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  // Fallback to local copy if GitHub raw fails
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes(FALLBACK_TEMPLATE_URL)) {
                    img.src = FALLBACK_TEMPLATE_URL;
                  }
                }}
                priority
              />

              {/* Name text overlay */}
              {imageLoaded && (
                <div
                  className="absolute pointer-events-auto cursor-move"
                  style={{
                    left: `${config.namePosition.x}%`,
                    top: `${config.namePosition.y}%`,
                    transform: `translate(${
                      config.textAlign === 'center' ? '-50%' :
                      config.textAlign === 'right' ? '-100%' : '0%'
                    }, -50%)`,
                    zIndex: 10,
                  }}
                  onMouseDown={handleMouseDown}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Name text */}
                  <div
                    className="whitespace-nowrap px-2 py-0.5"
                    style={{
                      fontSize: `${config.fontSize}px`,
                      fontFamily: config.fontFamily,
                      color: config.fontColor,
                      textAlign: config.textAlign,
                      textShadow: '0 0 4px rgba(255,255,255,0.8)',
                      minWidth: config.textAlign === 'center' ? '200px' : undefined,
                    }}
                  >
                    {config.nameText || 'Dr. John Smith'}
                  </div>

                  {/* Crosshair indicator */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="relative w-8 h-8">
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-teal-500/60" />
                      <div className="absolute left-1/2 top-0 h-full w-[1px] bg-teal-500/60" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-teal-500 bg-teal-500/30" />
                    </div>
                  </div>

                  {/* Bounding box indicator */}
                  <div className="absolute inset-0 border-2 border-dashed border-teal-500/40 rounded pointer-events-none" />
                </div>
              )}

              {/* Click position crosshair (temporary) */}
              <AnimatePresence>
                {crosshairPos && !isDragging && (
                  <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${crosshairPos.x}%`,
                      top: `${crosshairPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-10 h-10 border-2 border-teal-500 rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pixel Coordinates Card */}
          <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Coordinate Reference (for canvas generation)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">X (percent)</p>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{config.namePosition.x.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Y (percent)</p>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{config.namePosition.y.toFixed(1)}%</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">X (pixels)</p>
                <p className="text-lg font-mono font-bold text-teal-700 dark:text-teal-300">{pixelX}px</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Y (pixels)</p>
                <p className="text-lg font-mono font-bold text-teal-700 dark:text-teal-300">{pixelY}px</p>
              </div>
            </div>
            {imageNaturalSize.width > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Based on template image size: {imageNaturalSize.width} &times; {imageNaturalSize.height}px
              </p>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:w-80 space-y-4">
          {/* Save / Reset Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to GitHub'}
              </button>
              {saveError && (
                <p className="text-xs text-red-500 text-center">{saveError}</p>
              )}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Toggle Controls (mobile) */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-full flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl px-5 py-3 border border-gray-200 dark:border-slate-800 shadow-sm lg:hidden"
          >
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Text Controls</span>
            {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Text Controls */}
          <div className={`space-y-4 ${showControls ? 'block' : 'hidden lg:block'}`}>
            {/* Preview Name */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Preview Name
              </h3>
              <input
                type="text"
                value={config.nameText || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, nameText: e.target.value }))}
                placeholder="Enter preview name..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Position Fine-tuning */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Move className="w-4 h-4" />
                Position (fine-tune)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>X Position</span>
                    <span className="font-mono">{config.namePosition.x.toFixed(1)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={config.namePosition.x}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      namePosition: { ...prev.namePosition, x: parseFloat(e.target.value) }
                    }))}
                    className="w-full accent-teal-600"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Y Position</span>
                    <span className="font-mono">{config.namePosition.y.toFixed(1)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={config.namePosition.y}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      namePosition: { ...prev.namePosition, y: parseFloat(e.target.value) }
                    }))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Font Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Font Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Font Family</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => setConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {FONT_OPTIONS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Font Size</span>
                    <span className="font-mono">{config.fontSize}px</span>
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    step="1"
                    value={config.fontSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Font Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.fontColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, fontColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.fontColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, fontColor: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Text Align</label>
                  <div className="flex gap-2">
                    {([
                      { value: 'left' as const, icon: AlignLeft },
                      { value: 'center' as const, icon: AlignCenter },
                      { value: 'right' as const, icon: AlignRight },
                    ]).map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setConfig(prev => ({ ...prev, textAlign: value }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.textAlign === value
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Config JSON Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Config JSON Preview
              </h3>
              <pre className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
