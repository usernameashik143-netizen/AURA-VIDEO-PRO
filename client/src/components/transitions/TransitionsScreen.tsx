import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  Film,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { TransitionType } from '../../types/index.js';

interface TransitionItem {
  type: TransitionType;
  name: string;
  category: 'Classic' | 'Motion' | 'Wipe' | 'Zoom' | 'Glitch';
  badge?: string;
  description: string;
  defaultDuration: number;
}

const TRANSITIONS_DATA: TransitionItem[] = [
  {
    type: 'dissolve',
    name: 'Cross Dissolve',
    category: 'Classic',
    badge: 'DEFAULT',
    description: 'Smooth optical blend across incoming and outgoing video streams.',
    defaultDuration: 0.8,
  },
  {
    type: 'fade',
    name: 'Fade Through Black',
    category: 'Classic',
    description: 'Cinematic dip to darkness between key storytelling moments.',
    defaultDuration: 0.6,
  },
  {
    type: 'wipeleft',
    name: 'Wipe Left',
    category: 'Wipe',
    badge: 'POPULAR',
    description: 'Linear horizontal wipe sweeping across from right to left.',
    defaultDuration: 0.7,
  },
  {
    type: 'wiperight',
    name: 'Wipe Right',
    category: 'Wipe',
    description: 'Linear horizontal sweep moving smoothly from left to right.',
    defaultDuration: 0.7,
  },
  {
    type: 'slideleft',
    name: 'Slide Left',
    category: 'Motion',
    badge: 'TRENDING',
    description: 'Dynamic directional push displacement sliding incoming clip into view.',
    defaultDuration: 0.6,
  },
  {
    type: 'slideright',
    name: 'Slide Right',
    category: 'Motion',
    description: 'Directional push displacement shifting from left to right.',
    defaultDuration: 0.6,
  },
  {
    type: 'zoomin',
    name: 'Zoom In Punch',
    category: 'Zoom',
    badge: 'VIRAL',
    description: 'Rapid optical scale expansion drawing the viewer deep into the next shot.',
    defaultDuration: 0.5,
  },
  {
    type: 'zoomout',
    name: 'Zoom Out Reveal',
    category: 'Zoom',
    description: 'High-speed camera retreat revealing broad context of new scene.',
    defaultDuration: 0.5,
  },
  {
    type: 'glitch',
    name: 'Cyber Glitch',
    category: 'Glitch',
    badge: 'HOT',
    description: 'RGB channel split and high-frequency digital sync jitter.',
    defaultDuration: 0.4,
  },
  {
    type: 'blur',
    name: 'Motion Blur Dissolve',
    category: 'Motion',
    description: 'Directional Gaussian blur streak masking the cut point.',
    defaultDuration: 0.6,
  },
  {
    type: 'pixelize',
    name: 'Pixel Mosaic',
    category: 'Glitch',
    description: 'Retro 8-bit mosaic resolution downsampling between scenes.',
    defaultDuration: 0.5,
  },
  {
    type: 'smoothleft',
    name: 'Smooth Flow Left',
    category: 'Motion',
    description: 'Organic curved acceleration curve with whip blur simulation.',
    defaultDuration: 0.6,
  },
];

export const TransitionsScreen: React.FC = () => {
  const { currentProject, applyTransitionToAll, updateClip, setActiveSection, addToast } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTransition, setActiveTransition] = useState<TransitionItem>(TRANSITIONS_DATA[0]);
  const [duration, setDuration] = useState<number>(TRANSITIONS_DATA[0].defaultDuration);
  const [previewClipIndex, setPreviewClipIndex] = useState<number>(0);

  const categories = ['All', 'Classic', 'Motion', 'Wipe', 'Zoom', 'Glitch'];

  const filteredTransitions =
    selectedCategory === 'All'
      ? TRANSITIONS_DATA
      : TRANSITIONS_DATA.filter((t) => t.category === selectedCategory);

  const handleApplyToAllCuts = () => {
    if (!currentProject) {
      addToast({
        type: 'info',
        title: 'No Project Active',
        description: 'Open a project to apply transitions.',
      });
      return;
    }

    applyTransitionToAll({ type: activeTransition.type, duration });

    addToast({
      type: 'success',
      title: 'Transitions Applied!',
      description: `Applied ${activeTransition.name} (${duration}s) across all timeline cuts.`,
    });

    setActiveSection('editor');
  };

  const handleApplyToFirstCut = () => {
    if (!currentProject) {
      addToast({
        type: 'info',
        title: 'No Project Active',
        description: 'Open a project to apply transitions.',
      });
      return;
    }

    const videoTrack = currentProject.tracks.find((t) => t.type === 'video');
    const firstClip = videoTrack?.clips[0];

    if (!firstClip || !videoTrack) {
      addToast({
        type: 'warning',
        title: 'Empty Timeline',
        description: 'Add video clips to apply transitions.',
      });
      setActiveSection('editor');
      return;
    }

    updateClip(videoTrack.id, firstClip.id, {
      transition: {
        type: activeTransition.type,
        duration,
      },
    });

    addToast({
      type: 'success',
      title: 'Transition Set',
      description: `Set ${activeTransition.name} (${duration}s) on "${firstClip.name}".`,
    });

    setActiveSection('editor');
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#070709] text-white p-6 md:p-8 space-y-6 select-none">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d0d12] via-[#14141d] to-[#0a0a0f] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-600/70 text-zinc-200 text-xs font-semibold mb-3">
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-300" />
            <span>Cinematic Scene Transitions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Transitions & Cut Styles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            Seamlessly bridge scene cuts with FFmpeg xfade transition pipelines. Real crossfades, directional wipes, zoom punches, and glitch breaks.
          </p>
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Preview Player & Timing (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#111116] border border-zinc-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-300" />
                <span className="text-sm font-bold text-white">Transition Simulation</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202026] text-zinc-300 border border-zinc-700 font-bold uppercase">
                {activeTransition.category}
              </span>
            </div>

            {/* Video Box */}
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-zinc-800 shadow-inner group">
              <video
                key={previewClipIndex}
                src={previewClipIndex === 0 ? '/seeds/ready_cinematic_vibes.mp4' : '/seeds/nature_drone_mountains.mp4'}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-zinc-200">
                {activeTransition.name}
              </div>

              <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
                Duration: {duration.toFixed(2)}s
              </div>

              {/* Cycle preview clip button */}
              <button
                onClick={() => setPreviewClipIndex((prev) => (prev === 0 ? 1 : 0))}
                className="absolute bottom-2.5 left-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Switch clip"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeTransition.description}
            </p>

            {/* Duration Slider */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  Transition Duration
                </span>
                <span className="font-mono text-white font-bold">{duration.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.05"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleApplyToAllCuts}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-zinc-200 active:scale-[0.98] text-black font-bold text-xs shadow-lg shadow-white/10 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply to All Timeline Cuts</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <button
                onClick={handleApplyToFirstCut}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-all"
              >
                Apply to Current Selected Cut
              </button>
            </div>
          </div>
        </div>

        {/* Right: Transitions Cards (7 cols) */}
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
            {filteredTransitions.map((tr) => {
              const isSelected = activeTransition.type === tr.type;
              return (
                <div
                  key={tr.type}
                  onClick={() => {
                    setActiveTransition(tr);
                    setDuration(tr.defaultDuration);
                  }}
                  className={`group relative rounded-xl bg-[#111116] border p-3.5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-white/80 bg-[#161622] shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      : 'border-zinc-800/90 hover:border-zinc-700 hover:bg-[#141418]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                      <ArrowLeftRight className="w-4 h-4 text-zinc-300" />
                    </div>
                    {tr.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-[#202026] text-zinc-200 border border-zinc-700 text-[8px] font-extrabold uppercase tracking-wider">
                        {tr.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors block">
                      {tr.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {tr.category} • {tr.defaultDuration}s
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TransitionsScreen;
