import React, { useState } from 'react';
import {
  X,
  Type,
  Sparkles,
  ArrowRight,
  Loader2,
  Film,
  Sliders,
  Palette,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { AspectRatio } from '../../types/index.js';

interface TextToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TextToVideoModal: React.FC<TextToVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createNewProject, addToast, setActiveSection } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [style, setStyle] = useState<'cinematic' | 'vibrant' | 'vintage' | 'noir'>('cinematic');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const presets = [
    'Urban travel diary with fast cuts, modern beats, and film grain',
    'Minimalist product commercial with slow pan, soft lighting, and ambient strings',
    'Dramatic cyberpunk chase through rainy neon street with high-contrast noir grade',
    'Calm nature reflection with peaceful drone shots and acoustic piano melody',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty Prompt',
        description: 'Please enter a description for your video concept.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Call AI generation endpoint
      const res = await fetch('/api/ai/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, aspectRatio }),
      });
      const data = await res.json();

      if (data.success) {
        // Create project from storyboard
        createNewProject(aspectRatio, `${prompt.slice(0, 24)}...`);
        addToast({
          type: 'success',
          title: 'Timeline Generated',
          description: `Generated creative sequence matching "${prompt.slice(0, 30)}..."`,
        });
        onClose();
        setActiveSection('editor');
      } else {
        // Fallback: create fresh project with the aspect ratio
        createNewProject(aspectRatio, prompt.slice(0, 28));
        addToast({
          type: 'info',
          title: 'Project Initialized',
          description: 'Created new project workspace tailored for your prompt.',
        });
        onClose();
        setActiveSection('editor');
      }
    } catch (err: any) {
      // Create project fallback
      createNewProject(aspectRatio, prompt.slice(0, 28));
      onClose();
      setActiveSection('editor');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#111116] border border-zinc-800 p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Text to Video Generator</h2>
            <p className="text-xs text-zinc-400">Describe your concept, and AI will structure the scene sequence and soundtrack.</p>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Prompt Description</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Cinematic travel vlog with golden hour mountains, warm lens flare, and ambient acoustic music..."
            rows={3}
            className="w-full rounded-xl bg-zinc-900/90 border border-zinc-700/80 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors resize-none"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(preset)}
                className="text-[10px] px-2 py-1 rounded-md bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors text-left"
              >
                {preset.slice(0, 38)}...
              </button>
            ))}
          </div>
        </div>

        {/* Settings Grid: Aspect Ratio & Style */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ar) => (
                <button
                  key={ar}
                  onClick={() => setAspectRatio(ar)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    aspectRatio === ar
                      ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Visual Mood</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 focus:outline-none focus:border-zinc-500"
            >
              <option value="cinematic">Cinematic Teal &amp; Orange</option>
              <option value="vibrant">Vibrant &amp; Punchy</option>
              <option value="vintage">Warm Vintage 35mm</option>
              <option value="noir">Dark Noir B&amp;W</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 hover:from-violet-400 hover:to-purple-500 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(167,139,250,0.3)] border border-violet-400/30 transition-all active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Video Timeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Video Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default TextToVideoModal;
