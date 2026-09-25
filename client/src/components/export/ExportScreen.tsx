import React, { useState, useEffect } from 'react';
import {
  Download,
  Film,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HardDrive,
  Clock,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore.js';
import {
  Resolution,
  FrameRate,
  AspectRatio,
  VideoFormat,
  ExportQuality,
} from '../../types/index.js';
import { formatBytes } from '../../utils/time.js';

export const ExportScreen: React.FC = () => {
  const {
    currentProject,
    exportConfig,
    setExportConfig,
    startExport,
    activeRenderJob,
    isRenderingModalOpen,
    closeRenderingModal,
    setActiveSection,
  } = useAppStore();

  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (activeRenderJob?.status === 'completed' && !hasTriggeredConfetti) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#f4f4f5', '#e4e4e7', '#a1a1aa'],
      });
      setHasTriggeredConfetti(true);
    }
  }, [activeRenderJob?.status, hasTriggeredConfetti]);

  // Compute estimated size based on duration and bitrate
  const durationSec = currentProject?.duration || 20;
  let mbPerMinute = 80;
  if (exportConfig.resolution === '720p') mbPerMinute = 40;
  if (exportConfig.resolution === '1080p') mbPerMinute = 80;
  if (exportConfig.resolution === '1440p') mbPerMinute = 160;
  if (exportConfig.resolution === '4k') mbPerMinute = 320;

  if (exportConfig.quality === 'maximum') mbPerMinute *= 1.4;
  if (exportConfig.quality === 'standard') mbPerMinute *= 0.7;

  const estimatedSizeBytes = Math.round(((durationSec / 60) * mbPerMinute) * 1024 * 1024);

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#09090b] p-6 md:p-8 space-y-8 select-none">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-[#121215] border border-zinc-800 overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Hardware Accelerated FFmpeg Render</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Export Master Timeline
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            Encode your project into a broadcast-quality MP4 or WebM video file with multi-track color grading, transitions, subtitles, and background audio ducking.
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Resolution & Aspect Ratio */}
        <div className="space-y-6">
          {/* Resolution */}
          <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Resolution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['720p', '1080p', '1440p', '4k'] as Resolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setExportConfig({ resolution: res })}
                  className={`py-3 px-2 rounded-2xl text-center border transition-all ${
                    exportConfig.resolution === res
                      ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200 font-bold shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold uppercase">{res}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {res === '4k' ? 'Ultra HD' : res === '1080p' ? 'Full HD' : res === '1440p' ? 'Quad HD' : 'HD'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Aspect Ratio</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: '16:9', label: '16:9', desc: 'Landscape' },
                { id: '9:16', label: '9:16', desc: 'Vertical Reel' },
                { id: '1:1', label: '1:1', desc: 'Square' },
                { id: '4:5', label: '4:5', desc: 'Portrait' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setExportConfig({ aspectRatio: r.id as AspectRatio })}
                  className={`py-3 px-2 rounded-2xl text-center border transition-all ${
                    exportConfig.aspectRatio === r.id
                      ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200 font-bold shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Frame Rate, Format & Quality */}
        <div className="space-y-6">
          {/* Frame Rate */}
          <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Frame Rate (FPS)</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {([24, 30, 60] as FrameRate[]).map((fps) => (
                <button
                  key={fps}
                  onClick={() => setExportConfig({ fps })}
                  className={`py-3 px-2 rounded-2xl text-center border transition-all ${
                    exportConfig.fps === fps
                      ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200 font-bold shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                      : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold">{fps} FPS</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {fps === 24 ? 'Cinematic Film' : fps === 30 ? 'Standard Web' : 'Ultra Smooth'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format & Quality */}
          <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">Video Format</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {(['mp4', 'webm'] as VideoFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportConfig({ format: fmt })}
                    className={`py-2.5 rounded-xl text-center border font-mono uppercase text-xs transition-all ${
                      exportConfig.format === fmt
                        ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200 font-bold shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                        : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {fmt} (H.264 / VP9)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">Export Quality</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['standard', 'high', 'maximum'] as ExportQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setExportConfig({ quality: q })}
                    className={`py-2 rounded-xl text-center border capitalize text-xs transition-all ${
                      exportConfig.quality === q
                        ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200 font-bold shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                        : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary and Export Button */}
      <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Estimated Size</div>
              <div className="text-sm font-bold text-white font-mono">{formatBytes(estimatedSizeBytes)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Timeline Duration</div>
              <div className="text-sm font-bold text-white font-mono">{Math.round(durationSec)}s</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setHasTriggeredConfetti(false);
            startExport();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-12 py-4 rounded-2xl font-extrabold text-sm text-zinc-950 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-200 hover:from-teal-200 hover:to-cyan-200 border border-teal-400/40 shadow-[0_0_20px_rgba(45,212,191,0.25)] transition-all active:scale-95 tracking-wide"
        >
          <Download className="w-4 h-4 text-zinc-950" />
          <span>EXPORT VIDEO</span>
        </button>
      </div>

      {/* Live Rendering Modal */}
      {isRenderingModalOpen && activeRenderJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#121215] rounded-3xl p-8 border border-zinc-700 shadow-2xl space-y-6 text-center">
            {activeRenderJob.status === 'completed' ? (
              /* Success Stage */
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">Rendering Complete!</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your final video has been exported at {exportConfig.resolution} ({exportConfig.fps} FPS).
                  </p>
                </div>

                {/* Final video preview */}
                {activeRenderJob.previewUrl && (
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-800">
                    <video src={activeRenderJob.previewUrl} controls autoPlay className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={`/api/render/download/${activeRenderJob.jobId}`}
                    download
                    className="flex-1 py-3 px-5 rounded-xl font-bold text-xs bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center gap-2 border border-zinc-300 shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Final Video</span>
                  </a>

                  <button
                    onClick={() => {
                      closeRenderingModal();
                      setActiveSection('editor');
                    }}
                    className="py-3 px-5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
                  >
                    Back to Editor
                  </button>
                </div>
              </div>
            ) : activeRenderJob.status === 'failed' ? (
              /* Error Stage */
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Export Failed</h2>
                <p className="text-xs text-rose-300">{activeRenderJob.error}</p>
                <button
                  onClick={closeRenderingModal}
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Rendering in Progress */
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mx-auto shadow-sm">
                  <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">Rendering Your Video</h2>
                  <p className="text-xs text-zinc-400 mt-1">{activeRenderJob.stage}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-300"
                      style={{ width: `${activeRenderJob.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Encoding FFmpeg Stream</span>
                    <span className="text-white font-bold">{activeRenderJob.progress}%</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Please keep this browser window open while hardware rendering finishes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
