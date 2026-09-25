import React from 'react';
import { Wand2, Film, Layers, Sparkles, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

export const OnboardingModal: React.FC = () => {
  const { onboardingOpen, setOnboardingOpen, setActiveSection, createNewProject } = useAppStore();

  if (!onboardingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#121215] rounded-3xl p-8 border border-zinc-700 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setOnboardingOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Welcome to Aura Video Pro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your First Video
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
            Choose how you would like to start creating your video project today.
          </p>
        </div>

        {/* 3 Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Option 1: AI Auto Edit */}
          <div
            onClick={() => {
              setOnboardingOpen(false);
              setActiveSection('autoedit');
            }}
            className="group relative flex flex-col p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <Wand2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
              AI Auto Edit
            </h3>
            <p className="text-xs text-zinc-400 flex-1 leading-relaxed">
              Upload multiple clips and let AI automatically trim, transition, and synchronize with music.
            </p>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-zinc-300 group-hover:text-white group-hover:translate-x-1 transition-transform">
              <span>Start with AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Option 2: Start Editing */}
          <div
            onClick={() => {
              setOnboardingOpen(false);
              createNewProject('16:9');
            }}
            className="group relative flex flex-col p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
              Start Editing
            </h3>
            <p className="text-xs text-zinc-400 flex-1 leading-relaxed">
              Open the multi-track timeline and edit manually with full professional control.
            </p>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-zinc-300 group-hover:text-white group-hover:translate-x-1 transition-transform">
              <span>Open Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Option 3: Use Template */}
          <div
            onClick={() => {
              setOnboardingOpen(false);
              setActiveSection('templates');
            }}
            className="group relative flex flex-col p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
              Use Template
            </h3>
            <p className="text-xs text-zinc-400 flex-1 leading-relaxed">
              Pick from 14+ trending social, cinematic, and travel templates with preset pacing.
            </p>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-zinc-300 group-hover:text-white group-hover:translate-x-1 transition-transform">
              <span>Browse Templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-500">
          <span>You can always switch workflows from the sidebar navigation.</span>
          <button
            onClick={() => setOnboardingOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
};
