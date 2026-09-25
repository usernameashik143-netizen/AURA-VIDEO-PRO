import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCw,
  Move,
  Film,
  Layers,
  Palette,
  X,
  FlipHorizontal,
  FlipVertical,
  Clock,
  Music,
  Smile,
  Check,
  AlignCenter,
  AlignLeft,
  AlignRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { TransitionType, VideoAdjustment } from '../../types/index.js';

const FILTERS = [
  { id: 'none', label: 'Original Neutral' },
  // Category 1: Cinematic
  { id: 'cinematic', label: 'Cinematic Gold' },
  { id: 'film', label: 'Film 35mm' },
  { id: 'moody', label: 'Moody Shadow' },
  { id: 'dramatic', label: 'Dramatic Crush' },
  { id: 'teal_orange', label: 'Teal & Orange' },
  { id: 'warm_film', label: 'Warm Film' },
  { id: 'cold_film', label: 'Cold Film' },
  // Category 2: Vintage
  { id: 'vintage', label: 'Vintage 70s' },
  { id: 'retro', label: 'Retro Warm' },
  { id: 'vhs', label: 'VHS Tape' },
  { id: 'faded', label: 'Faded Matte' },
  { id: 'old_film', label: 'Old Film' },
  { id: 'sepia', label: 'Sepia Tone' },
  // Category 3: Black & White
  { id: 'noir', label: 'Film Noir (Pure B&W)' },
  { id: 'mono', label: 'Neutral Mono' },
  { id: 'high_contrast_bw', label: 'High Contrast B&W' },
  { id: 'soft_bw', label: 'Soft B&W' },
  // Category 4: Travel
  { id: 'travel', label: 'Scenic Travel' },
  { id: 'golden', label: 'Golden Hour' },
  { id: 'tropical', label: 'Tropical Island' },
  { id: 'sunset', label: 'Pacific Sunset' },
  // Category 5: Urban / Neon
  { id: 'cyberpunk', label: 'Cyberpunk Neon' },
  { id: 'neon', label: 'Electric Neon' },
  { id: 'tokyo_night', label: 'Tokyo Night' },
  { id: 'matrix_green', label: 'Matrix Terminal' },
  // Category 6: Clean / Commercial
  { id: 'clean_pop', label: 'Clean Pop' },
  { id: 'pastel', label: 'Pastel Dream' },
  { id: 'commercial', label: 'Clean Commercial' },
  { id: 'bright_airy', label: 'Bright & Airy' },
];

const TRANSITIONS: Array<{ id: TransitionType; label: string }> = [
  { id: 'none', label: 'Cut (None)' },
  { id: 'dissolve', label: 'Dissolve' },
  { id: 'fade', label: 'Fade to Black' },
  { id: 'slideleft', label: 'Slide Left' },
  { id: 'slideright', label: 'Slide Right' },
  { id: 'zoomin', label: 'Zoom In' },
  { id: 'zoomout', label: 'Zoom Out' },
  { id: 'wipeleft', label: 'Wipe Left' },
  { id: 'cinematic', label: 'Cinematic Dip' },
  { id: 'glitch', label: 'Glitch Cut' },
];

const FONTS = [
  'Plus Jakarta Sans',
  'Inter',
  'Playfair Display',
  'Space Grotesk',
  'JetBrains Mono',
  'Impact',
  'Georgia',
];

const EFFECTS_PRESETS = [
  { id: 'filmgrain', label: 'Film Grain', desc: '35mm organic luma grain' },
  { id: 'vignette', label: 'Optical Vignette', desc: 'Corner focus falloff' },
  { id: 'blur', label: 'Gaussian Blur', desc: 'Smooth depth defocus' },
  { id: 'bloom', label: 'Dreamy Bloom', desc: 'Diffuse optical glow' },
  { id: 'vhs', label: 'VHS Tape', desc: 'Retro scanlines & wobble' },
  { id: 'glitch', label: 'Cyber Glitch', desc: 'Digital artifact slice' },
  { id: 'letterbox', label: 'Cinemascope', desc: '2.35:1 widescreen matte' },
  { id: 'shake', label: 'Camera Shake', desc: 'Natural organic handheld' },
  { id: 'rgbsplit', label: 'RGB Split', desc: 'Chromatic color fringing' },
];

export const InspectorPanel: React.FC = () => {
  const {
    currentProject,
    activeClipId,
    activeTrackId,
    updateClip,
    selectClip,
    reverseClip,
  } = useAppStore();

  const [videoSubTab, setVideoSubTab] = useState<'transform' | 'color' | 'effects' | 'audio'>('transform');

  // 1. EMPTY STATE - Nothing selected
  if (!activeClipId || !currentProject) {
    return (
      <aside className="w-80 bg-[#101014] border-l border-zinc-800 p-6 flex flex-col items-center justify-center text-center select-none z-20">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
          <Sliders className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-zinc-200">Select a clip to edit</p>
        <p className="text-xs text-zinc-400 mt-1.5 max-w-[220px] leading-relaxed">
          Click any video, audio, or text clip on the timeline to inspect and customize its controls.
        </p>
      </aside>
    );
  }

  // Find active clip and track
  let foundTrack = currentProject.tracks.find((t) => t.id === activeTrackId);
  let activeClip = foundTrack?.clips.find((c) => c.id === activeClipId);

  if (!activeClip) {
    for (const t of currentProject.tracks) {
      const c = t.clips.find((item) => item.id === activeClipId);
      if (c) {
        foundTrack = t;
        activeClip = c;
        break;
      }
    }
  }

  if (!activeClip || !foundTrack) {
    return (
      <aside className="w-80 bg-[#101014] border-l border-zinc-800 p-6 flex flex-col items-center justify-center text-center select-none z-20">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
          <Sliders className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-zinc-200">Select a clip to edit</p>
      </aside>
    );
  }

  const isVideo = foundTrack.type === 'video';
  const isText = foundTrack.type === 'text';
  const isAudio = foundTrack.type === 'audio';
  const isSticker = foundTrack.type === 'sticker' || !!activeClip.sticker;

  const adj = activeClip.adjustments || {};

  const handleAdjChange = (field: keyof VideoAdjustment, value: number) => {
    updateClip(foundTrack!.id, activeClip!.id, {
      adjustments: { ...adj, [field]: value },
    });
  };

  return (
    <aside className="w-80 bg-[#101014] border-l border-zinc-800 flex flex-col overflow-y-auto select-none z-20">
      {/* Header with Close / Deselect */}
      <div className="h-11 px-4 border-b border-zinc-800 bg-[#121215] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isVideo && <Film className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
          {isText && <Type className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
          {isAudio && <Volume2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
          {isSticker && <Smile className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider truncate">
            {activeClip.text || activeClip.name}
          </span>
        </div>
        <button
          onClick={() => selectClip(null)}
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Deselect Clip"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CASE 1: VIDEO CLIP SELECTED -> Contextual Video Controls (Transform, Color, Effects) */}
      {/* ========================================================================= */}
      {isVideo && (
        <>
          {/* Sub-tabs for Video */}
          <div className="flex border-b border-zinc-800 bg-[#121215] px-2 py-1 gap-1 shrink-0">
            {(['transform', 'color', 'effects', 'audio'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setVideoSubTab(tab)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                  videoSubTab === tab
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* 1A. TRANSFORM */}
            {videoSubTab === 'transform' && (
              <div className="space-y-4">
                {/* Position (X, Y) */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Position (X, Y)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 bg-[#18181b] border border-zinc-800 rounded-xl px-2.5 py-1.5">
                      <span className="text-zinc-500 text-[10px] font-mono">X</span>
                      <input
                        type="number"
                        value={activeClip.positionX || 0}
                        onChange={(e) =>
                          updateClip(foundTrack!.id, activeClip!.id, {
                            positionX: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="bg-transparent w-full text-xs text-white focus:outline-none font-mono text-right"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-[#18181b] border border-zinc-800 rounded-xl px-2.5 py-1.5">
                      <span className="text-zinc-500 text-[10px] font-mono">Y</span>
                      <input
                        type="number"
                        value={activeClip.positionY || 0}
                        onChange={(e) =>
                          updateClip(foundTrack!.id, activeClip!.id, {
                            positionY: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="bg-transparent w-full text-xs text-white focus:outline-none font-mono text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 mb-1">
                    <span>Scale</span>
                    <span className="font-mono text-zinc-200">
                      {Math.round((activeClip.scale !== undefined ? activeClip.scale : 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={3.0}
                    step={0.05}
                    value={activeClip.scale !== undefined ? activeClip.scale : 1}
                    onChange={(e) =>
                      updateClip(foundTrack!.id, activeClip!.id, { scale: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 mb-1">
                    <span>Rotation</span>
                    <span className="font-mono text-zinc-200">{activeClip.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={activeClip.rotation || 0}
                    onChange={(e) =>
                      updateClip(foundTrack!.id, activeClip!.id, { rotation: parseInt(e.target.value, 10) })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 mb-1">
                    <span>Opacity</span>
                    <span className="font-mono text-zinc-200">
                      {Math.round((activeClip.opacity !== undefined ? activeClip.opacity : 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={activeClip.opacity !== undefined ? activeClip.opacity : 1}
                    onChange={(e) =>
                      updateClip(foundTrack!.id, activeClip!.id, { opacity: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                  />
                </div>

                {/* Speed Controls */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                    <span>Playback Speed</span>
                    <span className="font-mono text-zinc-200 font-bold">{(activeClip.speed || 1).toFixed(2)}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mb-1.5">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => updateClip(foundTrack!.id, activeClip!.id, { speed: spd })}
                        className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                          (activeClip.speed || 1) === spd
                            ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={4.0}
                    step={0.05}
                    value={activeClip.speed || 1}
                    onChange={(e) =>
                      updateClip(foundTrack!.id, activeClip!.id, { speed: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                  />
                </div>

                {/* Chroma Key / Background Removal */}
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Chroma Key (Green Screen)</div>
                      <div className="text-[10px] text-zinc-400">Colorkey transparent background</div>
                    </div>
                    <button
                      onClick={() =>
                        updateClip(foundTrack!.id, activeClip!.id, {
                          removeBackground: !activeClip!.removeBackground,
                          bgKeyColor: activeClip!.bgKeyColor || '0x00FF00',
                        })
                      }
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        activeClip.removeBackground
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {activeClip.removeBackground ? 'KEY ON' : 'OFF'}
                    </button>
                  </div>

                  {activeClip.removeBackground && (
                    <div className="flex gap-1.5 pt-1 border-t border-zinc-800">
                      {[
                        { color: '0x00FF00', bg: 'bg-emerald-500', name: 'Green' },
                        { color: '0x0000FF', bg: 'bg-blue-600', name: 'Blue' },
                        { color: '0xFFFFFF', bg: 'bg-white', name: 'White' },
                        { color: '0x000000', bg: 'bg-black', name: 'Black' },
                      ].map((kc) => (
                        <button
                          key={kc.color}
                          onClick={() =>
                            updateClip(foundTrack!.id, activeClip!.id, { bgKeyColor: kc.color })
                          }
                          className={`flex-1 py-1 rounded-lg text-[9px] font-bold border flex items-center justify-center gap-1 ${
                            activeClip.bgKeyColor === kc.color ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${kc.bg}`} />
                          <span>{kc.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Flips & Reverse */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
                  <button
                    onClick={() => updateClip(foundTrack!.id, activeClip!.id, { flipH: !activeClip.flipH })}
                    className={`py-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                      activeClip.flipH
                        ? 'bg-zinc-800 text-white border border-zinc-600'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <FlipHorizontal className="w-3 h-3" />
                    <span>Flip H</span>
                  </button>

                  <button
                    onClick={() => updateClip(foundTrack!.id, activeClip!.id, { flipV: !activeClip.flipV })}
                    className={`py-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                      activeClip.flipV
                        ? 'bg-zinc-800 text-white border border-zinc-600'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <FlipVertical className="w-3 h-3" />
                    <span>Flip V</span>
                  </button>

                  <button
                    onClick={() => reverseClip(foundTrack!.id, activeClip!.id)}
                    className={`py-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                      activeClip.reverse
                        ? 'bg-zinc-800 text-white border border-zinc-600'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Reverse</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1B. FULL COLOR ADJUSTMENTS SUITE */}
            {videoSubTab === 'color' && (
              <div className="space-y-4">
                {/* Light */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Light & Exposure</div>
                  {[
                    { key: 'exposure' as const, label: 'Exposure', min: -100, max: 100 },
                    { key: 'brightness' as const, label: 'Brightness', min: -100, max: 100 },
                    { key: 'contrast' as const, label: 'Contrast', min: -100, max: 100 },
                    { key: 'highlights' as const, label: 'Highlights', min: -100, max: 100 },
                    { key: 'shadows' as const, label: 'Shadows', min: -100, max: 100 },
                    { key: 'whites' as const, label: 'Whites', min: -100, max: 100 },
                    { key: 'blacks' as const, label: 'Blacks', min: -100, max: 100 },
                  ].map(({ key, label, min, max }) => {
                    const val = adj[key] !== undefined ? adj[key] : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-zinc-400">
                          <span>{label}</span>
                          <span className="font-mono text-zinc-200">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => handleAdjChange(key, parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Color Tone */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Color & Tone</div>
                  {[
                    { key: 'temperature' as const, label: 'Temperature', min: -100, max: 100 },
                    { key: 'tint' as const, label: 'Tint', min: -100, max: 100 },
                    { key: 'saturation' as const, label: 'Saturation', min: -100, max: 100 },
                    { key: 'vibrance' as const, label: 'Vibrance', min: -100, max: 100 },
                    { key: 'hue' as const, label: 'Hue Rotate', min: -180, max: 180 },
                  ].map(({ key, label, min, max }) => {
                    const val = adj[key] !== undefined ? adj[key] : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-zinc-400">
                          <span>{label}</span>
                          <span className="font-mono text-zinc-200">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => handleAdjChange(key, parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Detail & Optics */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Detail & Optics</div>
                  {[
                    { key: 'sharpness' as const, label: 'Sharpness', min: 0, max: 100 },
                    { key: 'clarity' as const, label: 'Clarity', min: 0, max: 100 },
                    { key: 'grain' as const, label: 'Film Grain', min: 0, max: 100 },
                    { key: 'vignette' as const, label: 'Vignette', min: 0, max: 100 },
                    { key: 'fade' as const, label: 'Fade Lift', min: 0, max: 100 },
                    { key: 'blur' as const, label: 'Blur', min: 0, max: 100 },
                  ].map(({ key, label, min, max }) => {
                    const val = adj[key] !== undefined ? adj[key] : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-zinc-400">
                          <span>{label}</span>
                          <span className="font-mono text-zinc-200">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => handleAdjChange(key, parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => updateClip(foundTrack!.id, activeClip!.id, { adjustments: {} })}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                >
                  Reset All Adjustments
                </button>
              </div>
            )}

            {/* 1C. FILTER & EFFECTS */}
            {videoSubTab === 'effects' && (
              <div className="space-y-4">
                {/* Active Filter LUT */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Color LUT Filter
                  </label>
                  <select
                    value={activeClip.filter || 'none'}
                    onChange={(e) => updateClip(foundTrack!.id, activeClip!.id, { filter: e.target.value })}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                  >
                    {FILTERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transition Out */}
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Transition Out
                  </label>
                  <select
                    value={activeClip.transition?.type || 'none'}
                    onChange={(e) =>
                      updateClip(foundTrack!.id, activeClip!.id, {
                        transition: {
                          type: e.target.value as TransitionType,
                          duration: e.target.value === 'none' ? 0 : 0.6,
                        },
                      })
                    }
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                  >
                    {TRANSITIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visual Effects List */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Active Effects
                  </label>
                  {EFFECTS_PRESETS.map((eff) => {
                    const currentEffects = activeClip.effects || [];
                    const activeEff = currentEffects.find((e) => e.type === eff.id);
                    const isEnabled = !!activeEff;

                    return (
                      <div
                        key={eff.id}
                        className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{eff.label}</span>
                          <button
                            onClick={() => {
                              const updated = isEnabled
                                ? currentEffects.filter((e) => e.type !== eff.id)
                                : [
                                    ...currentEffects,
                                    { id: `eff-${Date.now()}`, type: eff.id, intensity: 50, enabled: true },
                                  ];
                              updateClip(foundTrack!.id, activeClip!.id, { effects: updated });
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                              isEnabled
                                ? 'bg-zinc-200 text-zinc-950 font-bold'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {isEnabled ? 'Enabled' : 'Off'}
                          </button>
                        </div>

                        {isEnabled && (
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                              <span>Intensity</span>
                              <span className="text-zinc-200">{activeEff.intensity}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={activeEff.intensity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                const updated = currentEffects.map((item) =>
                                  item.type === eff.id ? { ...item, intensity: val } : item
                                );
                                updateClip(foundTrack!.id, activeClip!.id, { effects: updated });
                              }}
                              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-200"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1D. VIDEO CLIP AUDIO TRACK & ENHANCEMENT */}
            {videoSubTab === 'audio' && (
              <div className="space-y-4">
                {/* Mute Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    {activeClip.isMuted ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-zinc-200" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">Clip Audio Track</div>
                      <div className="text-[10px] text-zinc-400">
                        {activeClip.isMuted ? 'Muted in playback & export' : 'Audible in playback & export'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      updateClip(foundTrack!.id, activeClip!.id, { isMuted: !activeClip!.isMuted })
                    }
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      activeClip.isMuted
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700'
                    }`}
                  >
                    {activeClip.isMuted ? 'MUTED' : 'UNMUTED'}
                  </button>
                </div>

                {/* Volume Control */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Clip Audio Volume
                    </label>
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      {Math.round((activeClip.volume !== undefined ? activeClip.volume : 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={activeClip.volume !== undefined ? activeClip.volume : 1}
                    onChange={(e) =>
                      updateClip(foundTrack!.id, activeClip!.id, { volume: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                  />
                </div>

                {/* Audio AI Enhancements */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Audio Processing
                  </label>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs text-zinc-200">Voice Enhance (3kHz boost)</span>
                    <button
                      onClick={() =>
                        updateClip(foundTrack!.id, activeClip!.id, { voiceEnhance: !activeClip!.voiceEnhance })
                      }
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        activeClip.voiceEnhance ? 'bg-zinc-200 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {activeClip.voiceEnhance ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs text-zinc-200">Noise Reduction (-25dB)</span>
                    <button
                      onClick={() =>
                        updateClip(foundTrack!.id, activeClip!.id, { noiseReduction: !activeClip!.noiseReduction })
                      }
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        activeClip.noiseReduction ? 'bg-zinc-200 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {activeClip.noiseReduction ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-xs text-zinc-200">Loudness Normalization (-16 LUFS)</span>
                    <button
                      onClick={() =>
                        updateClip(foundTrack!.id, activeClip!.id, { normalize: !activeClip!.normalize })
                      }
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        activeClip.normalize ? 'bg-zinc-200 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {activeClip.normalize ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* CASE 2: AUDIO CLIP SELECTED -> Contextual Audio Controls (Volume, Mute, Fade) */}
      {/* ========================================================================= */}
      {isAudio && (
        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-2.5">
              {activeClip.isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-zinc-200" />
              )}
              <div>
                <div className="text-xs font-bold text-white">Audio Mute</div>
                <div className="text-[10px] text-zinc-400">
                  {activeClip.isMuted ? 'Muted in final export' : 'Audible in final export'}
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                updateClip(foundTrack!.id, activeClip!.id, { isMuted: !activeClip!.isMuted })
              }
              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                activeClip.isMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700'
              }`}
            >
              {activeClip.isMuted ? 'MUTED' : 'UNMUTED'}
            </button>
          </div>

          {/* Volume Control */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Track Volume
              </label>
              <span className="text-xs font-mono font-bold text-zinc-200">
                {Math.round((activeClip.volume !== undefined ? activeClip.volume : 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={activeClip.volume !== undefined ? activeClip.volume : 1}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, { volume: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
            />
          </div>

          {/* Fade In */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Fade In Duration
              </label>
              <span className="text-xs font-mono font-bold text-zinc-200">
                {(activeClip.fadeIn || 0).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5.0}
              step={0.1}
              value={activeClip.fadeIn || 0}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, { fadeIn: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
            />
          </div>

          {/* Fade Out */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Fade Out Duration
              </label>
              <span className="text-xs font-mono font-bold text-zinc-200">
                {(activeClip.fadeOut || 0).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5.0}
              step={0.1}
              value={activeClip.fadeOut || 0}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, { fadeOut: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
            />
          </div>

          {/* Broadcast Normalization & EQ */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Audio Processing
            </label>

            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Noise Filter</div>
                <div className="text-[9px] text-zinc-500">FFmpeg FFT filter denoiser</div>
              </div>
              <input
                type="checkbox"
                checked={!!activeClip.noiseReduction}
                onChange={(e) =>
                  updateClip(foundTrack!.id, activeClip!.id, { noiseReduction: e.target.checked })
                }
                className="rounded border-zinc-700 bg-zinc-800 text-zinc-200 cursor-pointer accent-zinc-300"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-zinc-200">EBU R128 Master</div>
                <div className="text-[9px] text-zinc-500">Target -14 LUFS broadcast loudness</div>
              </div>
              <input
                type="checkbox"
                checked={!!activeClip.normalize}
                onChange={(e) =>
                  updateClip(foundTrack!.id, activeClip!.id, { normalize: e.target.checked })
                }
                className="rounded border-zinc-700 bg-zinc-800 text-zinc-200 cursor-pointer accent-zinc-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 3: TEXT CLIP SELECTED -> Contextual Typography Controls */}
      {/* ========================================================================= */}
      {isText && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Text Content */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Text Content
            </label>
            <textarea
              value={activeClip.text || ''}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, { text: e.target.value })
              }
              rows={3}
              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Font Family
            </label>
            <select
              value={activeClip.style?.fontFamily || 'Plus Jakarta Sans'}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, {
                  style: { ...activeClip!.style, fontFamily: e.target.value } as any,
                })
              }
              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 mb-1">
              <span>Font Size</span>
              <span className="font-mono text-zinc-200">{activeClip.style?.fontSize || 36}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={100}
              value={activeClip.style?.fontSize || 36}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, {
                  style: { ...activeClip!.style, fontSize: parseInt(e.target.value, 10) } as any,
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
            />
          </div>

          {/* Font Weight */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Weight
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(['normal', 'medium', 'bold', 'black'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() =>
                    updateClip(foundTrack!.id, activeClip!.id, {
                      style: { ...activeClip!.style, fontWeight: w } as any,
                    })
                  }
                  className={`py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                    (activeClip.style?.fontWeight || 'bold') === w
                      ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={activeClip.style?.color || '#ffffff'}
                onChange={(e) =>
                  updateClip(foundTrack!.id, activeClip!.id, {
                    style: { ...activeClip!.style, color: e.target.value } as any,
                  })
                }
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
              />
              <div className="flex gap-1.5 flex-1">
                {['#ffffff', '#f4f4f5', '#e4e4e7', '#facc15', '#38bdf8', '#f43f5e', '#10b981'].map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      updateClip(foundTrack!.id, activeClip!.id, {
                        style: { ...activeClip!.style, color: c } as any,
                      })
                    }
                    style={{ backgroundColor: c }}
                    className="w-5 h-5 rounded-full border border-black/40 hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Position
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() =>
                    updateClip(foundTrack!.id, activeClip!.id, {
                      style: { ...activeClip!.style, position: pos } as any,
                    })
                  }
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    (activeClip.style?.position || 'center') === pos
                      ? 'bg-zinc-800 text-white border border-zinc-600 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Animation */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Animation
            </label>
            <select
              value={activeClip.style?.animation || 'fade'}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, {
                  style: { ...activeClip!.style, animation: e.target.value } as any,
                })
              }
              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {['none', 'fade', 'pop', 'slide', 'typewriter', 'glitch'].map((anim) => (
                <option key={anim} value={anim}>
                  {anim.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 4: STICKER CLIP SELECTED */}
      {/* ========================================================================= */}
      {isSticker && (
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl">
            {activeClip.sticker?.content || '✨'}
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 mb-1">
              <span>Scale</span>
              <span className="font-mono text-zinc-200">
                {Math.round((activeClip.scale !== undefined ? activeClip.scale : 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.05}
              value={activeClip.scale !== undefined ? activeClip.scale : 1}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, { scale: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 mb-1">
              <span>Rotation</span>
              <span className="font-mono text-zinc-200">{activeClip.rotation || 0}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={activeClip.rotation || 0}
              onChange={(e) =>
                updateClip(foundTrack!.id, activeClip!.id, { rotation: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default InspectorPanel;
