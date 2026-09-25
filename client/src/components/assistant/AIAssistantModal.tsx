import React, { useState } from 'react';
import { Wand2, Sparkles, Send, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

const QUICK_PROMPTS = [
  'Make this video cinematic',
  'Cut clips to the music beat',
  'Add 2.35:1 letterbox bars',
  'Add captions',
  'Auto-duck background music for dialogue',
  'Make the transitions smoother',
  'Enhance dialogue EQ',
  'Add 35mm organic film grain',
  'Speed up clips 1.5x',
  'Make a 30 second Instagram Reel',
  'Apply high-contrast noir grade',
  'Remove all silent pauses',
];

export const AIAssistantModal: React.FC = () => {
  const { assistantOpen, setAssistantOpen, runAIAssistant } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!assistantOpen) return null;

  const handleSubmit = async (cmdToRun?: string) => {
    const text = (cmdToRun || prompt).trim();
    if (!text) return;

    setIsProcessing(true);
    setStatusMessage('Analyzing prompt & project timeline...');

    const stages = [
      'Evaluating clip pacing & salience...',
      'Adjusting transitions and cuts...',
      'Applying color grades and soundtrack sync...',
      'Finalizing modified timeline...',
    ];

    for (const st of stages) {
      await new Promise((r) => setTimeout(r, 450));
      setStatusMessage(st);
    }

    await runAIAssistant(text);
    setIsProcessing(false);
    setPrompt('');
    setAssistantOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#121215] rounded-3xl p-6 sm:p-8 border border-zinc-700 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setAssistantOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 shadow-sm">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">AI Director Assistant</h2>
            <p className="text-xs text-zinc-400">Describe what changes you want to apply to this project</p>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-zinc-300 animate-spin mx-auto" />
            <div className="text-xs font-semibold text-white">{statusMessage}</div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-zinc-400 via-white to-zinc-300 shimmer-active w-full" />
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Make this video cinematic, add subtitles, or cut boring parts..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSubmit()}
            disabled={isProcessing}
            autoFocus
            className="w-full bg-[#18181b] border border-zinc-800 focus:border-zinc-500 rounded-2xl pl-4 pr-12 py-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={isProcessing || !prompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-40 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Suggested Prompts */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Suggested AI Commands
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(q)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
