import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Zap,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { ClipEffect } from '../../types/index.js';

interface VisualEffectDef {
  id: string;
  name: string;
  category: 'Glitch' | 'Retro' | 'Cinematic' | 'Color' | 'Motion' | 'Blur';
  badge?: string;
  description: string;
  sampleVideo: string;
  thumbnailUrl: string;
  defaultIntensity: number;
}

const AVAILABLE_EFFECTS: VisualEffectDef[] = [
  {
    id: 'glitch',
    name: 'Glitch',
    category: 'Glitch',
    badge: 'POPULAR',
    description: 'Chromatic RGB displacement with dynamic signal tear artifacts and scanlines.',
    sampleVideo: '/seeds/ready_dark_aesthetic.mp4',
    thumbnailUrl: '/thumbnails/fx-glitch.jpg',
    defaultIntensity: 65,
  },
  {
    id: 'shake',
    name: 'Shake',
    category: 'Motion',
    badge: 'TRENDING',
    description: 'Dynamic handheld camera tremor and violent bass impact vibration.',
    sampleVideo: '/seeds/sports_motion_rush.mp4',
    thumbnailUrl: '/thumbnails/fx-shake.jpg',
    defaultIntensity: 70,
  },
  {
    id: 'blur',
    name: 'Blur',
    category: 'Blur',
    description: 'Variable Gaussian lens defocus with soft peripheral bokeh scatter.',
    sampleVideo: '/seeds/ready_nature_escape.mp4',
    thumbnailUrl: '/thumbnails/fx-blur.jpg',
    defaultIntensity: 50,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    category: 'Retro',
    description: '1970s warm tungsten sepia emulsion with organic dust and border burn.',
    sampleVideo: '/seeds/ready_love_story.mp4',
    thumbnailUrl: '/thumbnails/fx-vintage.jpg',
    defaultIntensity: 60,
  },
  {
    id: 'bw',
    name: 'B&W Film',
    category: 'Cinematic',
    badge: 'CLASSIC',
    description: 'High contrast monochrome silver halide grain with deep dramatic shadows.',
    sampleVideo: '/seeds/ready_cinematic_vibes.mp4',
    thumbnailUrl: '/thumbnails/fx-bw.jpg',
    defaultIntensity: 80,
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    category: 'Color',
    badge: 'HOT',
    description: 'Electrifying cyberpunk edge luminance with amplified cyan-magenta saturation.',
    sampleVideo: '/seeds/cyberpunk_neon_city.mp4',
    thumbnailUrl: '/thumbnails/fx-neon.jpg',
    defaultIntensity: 75,
  },
  {
    id: 'filmgrain',
    name: '35mm Film Grain',
    category: 'Retro',
    description: 'Authentic 35mm analogue celluloid silver grain noise overlay.',
    sampleVideo: '/seeds/ready_nature_escape.mp4',
    thumbnailUrl: '/thumbnails/fx-blur.jpg',
    defaultIntensity: 55,
  },
  {
    id: 'rgb_split',
    name: 'RGB Split',
    category: 'Glitch',
    description: 'Optical prism chromatic dispersion separating red, green, and blue planes.',
    sampleVideo: '/seeds/ready_travel_diaries.mp4',
    thumbnailUrl: '/thumbnails/fx-glitch.jpg',
    defaultIntensity: 60,
  },
  {
    id: 'vignette',
    name: 'Cinematic Vignette',
    category: 'Cinematic',
    description: 'Soft perimeter optical light falloff concentrating attention at center.',
    sampleVideo: '/seeds/ready_cinematic_vibes.mp4',
    thumbnailUrl: '/thumbnails/fx-bw.jpg',
    defaultIntensity: 70,
  },
  {
    id: 'lensflare',
    name: 'Anamorphic Flare',
    category: 'Cinematic',
    description: 'Horizontal cinematic streak and blue anamorphic lens flare accent.',
    sampleVideo: '/seeds/ready_slow_motion.mp4',
    thumbnailUrl: '/thumbnails/fx-neon.jpg',
    defaultIntensity: 65,
  },
  {
    id: 'zoom_pulse',
    name: 'Zoom Pulse',
    category: 'Motion',
    description: 'Rhythmic bass-synced zoom oscillation pumping to the beat.',
    sampleVideo: '/seeds/sports_motion_rush.mp4',
    thumbnailUrl: '/thumbnails/fx-shake.jpg',
    defaultIntensity: 70,
  },
  {
    id: 'vhs',
    name: 'VHS Camcorder',
    category: 'Retro',
    description: '1990s magnetic tape tracking jitter, tape noise, and phosphor color drift.',
    sampleVideo: '/seeds/ready_dark_aesthetic.mp4',
    thumbnailUrl: '/thumbnails/fx-vintage.jpg',
    defaultIntensity: 60,
  },
];

export const EffectsScreen: React.FC = () => {
  const { currentProject, updateClip, addToast, setActiveSection } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeEffect, setActiveEffect] = useState<VisualEffectDef>(AVAILABLE_EFFECTS[0]);
  const [intensity, setIntensity] = useState<number>(AVAILABLE_EFFECTS[0].defaultIntensity);

  const categories = ['All', 'Glitch', 'Motion', 'Cinematic', 'Retro', 'Color', 'Blur'];

  const filteredEffects = AVAILABLE_EFFECTS.filter(
    (eff) => selectedCategory === 'All' || eff.category === selectedCategory
  );

  const handleSelectEffect = (eff: VisualEffectDef) => {
    setActiveEffect(eff);
    setIntensity(eff.defaultIntensity);
  };

  const handleApplyToTimeline = () => {
    if (!currentProject) {
      addToast({
        type: 'warning',
        title: 'No Project',
        description: 'Please create or load a project before applying effects.',
      });
      return;
    }

    const videoTrack = currentProject.tracks.find((t) => t.type === 'video');
    const firstClip = videoTrack?.clips[0];

    if (!videoTrack || !firstClip) {
      addToast({
        type: 'warning',
        title: 'No Video Clips',
        description: 'Add a video clip to your timeline before applying effects.',
      });
      setActiveSection('editor');
      return;
    }

    const newEffect: ClipEffect = {
      id: `eff-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: activeEffect.id,
      intensity,
      enabled: true,
    };

    const existingEffects = firstClip.effects || [];
    const updatedEffects = [
      ...existingEffects.filter((e) => e.type !== activeEffect.id),
      newEffect,
    ];

    updateClip(videoTrack.id, firstClip.id, {
      effects: updatedEffects,
    });

    addToast({
      type: 'success',
      title: 'Effect Applied!',
      description: `Applied ${activeEffect.name} (${intensity}%) to "${firstClip.name}".`,
    });

    setActiveSection('editor');
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#070709] text-white p-6 md:p-8 space-y-6 select-none">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d0d12] via-[#14141d] to-[#0a0a0f] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-600/70 text-zinc-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>GPU-Accelerated Visual FX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Visual Effects & Color Grading
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            Apply high-impact visual effects rendered with real FFmpeg video filter chains. From chromatic glitch to analog 35mm film grain and anamorphic flares.
          </p>
        </div>
      </div>

      {/* Main Split: Live Interactive Preview + Effects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Effect Inspector & Player (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#111116] border border-zinc-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-zinc-300" />
                <span className="text-sm font-bold text-white">Effect Preview</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202026] text-zinc-300 border border-zinc-700 font-bold uppercase">
                {activeEffect.category}
              </span>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-zinc-800 shadow-inner group">
              <video
                src={activeEffect.sampleVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{
                  filter:
                    activeEffect.id === 'bw'
                      ? `grayscale(1) contrast(${1 + intensity / 100})`
                      : activeEffect.id === 'vintage'
                      ? `sepia(${intensity / 100}) contrast(1.1) brightness(0.95)`
                      : activeEffect.id === 'blur'
                      ? `blur(${(intensity / 100) * 8}px)`
                      : activeEffect.id === 'neon'
                      ? `saturate(${1 + (intensity / 100) * 2}) contrast(1.2)`
                      : undefined,
                }}
              />

              <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-zinc-200">
                {activeEffect.name}
              </div>

              <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
                Intensity: {intensity}%
              </div>
            </div>

            {/* Effect Description */}
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeEffect.description}
            </p>

            {/* Intensity Slider */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  Effect Intensity
                </span>
                <span className="font-mono text-white font-bold">{intensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Apply Button (Pristine Silver/White) */}
            <button
              onClick={handleApplyToTimeline}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-zinc-200 active:scale-[0.98] text-black font-bold text-xs shadow-lg shadow-white/10 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply to Active Timeline</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Right Column: Effects Browser Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredEffects.map((eff) => {
              const isSelected = activeEffect.id === eff.id;
              return (
                <div
                  key={eff.id}
                  onClick={() => handleSelectEffect(eff)}
                  className={`group relative rounded-xl bg-[#111116] border p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-white/80 bg-[#161620] shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      : 'border-zinc-800/90 hover:border-zinc-700 hover:bg-[#141418]'
                  }`}
                >
                  <div className="relative aspect-video rounded-lg bg-black/40 overflow-hidden mb-2.5">
                    <img
                      src={eff.thumbnailUrl}
                      alt={eff.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {eff.badge && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#202026] text-zinc-200 border border-zinc-700 text-[8px] font-extrabold uppercase tracking-wider">
                        {eff.badge}
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/10 border-2 border-white rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">
                        {eff.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {eff.category} • {eff.defaultIntensity}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EffectsScreen;
