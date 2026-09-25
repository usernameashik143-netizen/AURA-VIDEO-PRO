import React from 'react';
import {
  Wand2,
  Type,
  Mic,
  Scissors,
  Palette,
  Crop,
  Sparkles,
  MessageSquare,
  FileText,
  Zap,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

interface AITool {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  status: 'available' | 'opens-editor' | 'coming-soon';
  action: () => void;
}

export const AIToolsScreen: React.FC = () => {
  const { setActiveSection, createNewProject, setAssistantOpen, addToast } = useAppStore();

  const openEditorWithPanel = (panel: string) => {
    createNewProject('16:9');
    // After navigation, the editor will default-open the relevant panel
    addToast({
      type: 'info',
      title: `${panel} ready`,
      description: 'Editor opened. Select a clip and open the panel on the left.',
    });
  };

  const comingSoon = (label: string) => {
    addToast({
      type: 'info',
      title: 'Coming Soon',
      description: `${label} requires additional cloud configuration.`,
    });
  };

  const tools: AITool[] = [
    {
      id: 'auto-editor',
      label: 'AI Auto Editor',
      description: 'Automatically selects and cuts your best clips, adds BGM and transitions.',
      icon: Wand2,
      iconColor: 'text-violet-300',
      iconBg: 'bg-violet-950/60 border-violet-700/40',
      status: 'available',
      action: () => setActiveSection('autoedit'),
    },
    {
      id: 'text-to-video',
      label: 'Text to Video',
      description: 'Describe your vision, AI structures a scene sequence and soundtrack.',
      icon: Type,
      iconColor: 'text-violet-300',
      iconBg: 'bg-violet-950/60 border-violet-700/40',
      status: 'available',
      action: () => setActiveSection('autoedit'),
    },
    {
      id: 'ai-voiceover',
      label: 'AI Voiceover',
      description: 'Realistic text-to-speech voices for narration and character dialogue.',
      icon: Mic,
      iconColor: 'text-violet-300',
      iconBg: 'bg-violet-950/60 border-violet-700/40',
      status: 'opens-editor',
      action: () => openEditorWithPanel('AI Voiceover'),
    },
    {
      id: 'bg-removal',
      label: 'Background Removal',
      description: 'Remove image or video backgrounds with neural segmentation (u2netp).',
      icon: Scissors,
      iconColor: 'text-cyan-300',
      iconBg: 'bg-cyan-950/50 border-cyan-700/40',
      status: 'opens-editor',
      action: () => openEditorWithPanel('Background Removal'),
    },
    {
      id: 'ai-color',
      label: 'AI Color Grading',
      description: 'Cinematic LUT suggestions and one-tap color correction for your clips.',
      icon: Palette,
      iconColor: 'text-cyan-300',
      iconBg: 'bg-cyan-950/50 border-cyan-700/40',
      status: 'opens-editor',
      action: () => openEditorWithPanel('Color Grading'),
    },
    {
      id: 'smart-crop',
      label: 'Smart Crop',
      description: 'AI detects subjects and automatically reframes for 9:16, 1:1 or 16:9.',
      icon: Crop,
      iconColor: 'text-cyan-300',
      iconBg: 'bg-cyan-950/50 border-cyan-700/40',
      status: 'coming-soon',
      action: () => comingSoon('Smart Crop'),
    },
    {
      id: 'beat-sync',
      label: 'Beat Sync',
      description: 'Automatically cuts your clips to match the BPM of your background music.',
      icon: Zap,
      iconColor: 'text-amber-300',
      iconBg: 'bg-amber-950/50 border-amber-700/40',
      status: 'available',
      action: () => setActiveSection('autoedit'),
    },
    {
      id: 'ai-captions',
      label: 'Auto Captions',
      description: 'Speech recognition generates timed captions. Requires STT configuration.',
      icon: Sparkles,
      iconColor: 'text-violet-300',
      iconBg: 'bg-violet-950/60 border-violet-700/40',
      status: 'coming-soon',
      action: () => comingSoon('Auto Captions (speech-to-text not configured)'),
    },
    {
      id: 'ai-assistant',
      label: 'AI Director Assistant',
      description: 'Natural language editing — describe what you want and AI applies it.',
      icon: MessageSquare,
      iconColor: 'text-violet-300',
      iconBg: 'bg-violet-950/60 border-violet-700/40',
      status: 'available',
      action: () => { setAssistantOpen(true); },
    },
    {
      id: 'script-gen',
      label: 'Script Generator',
      description: 'Generate a video script from a topic, tone and target audience.',
      icon: FileText,
      iconColor: 'text-violet-300',
      iconBg: 'bg-violet-950/60 border-violet-700/40',
      status: 'coming-soon',
      action: () => comingSoon('Script Generator'),
    },
    {
      id: 'ai-writer',
      label: 'AI Writer',
      description: 'Generate titles, descriptions, hashtags and social copy for your video.',
      icon: Brain,
      iconColor: 'text-violet-300',
      iconBg: 'bg-violet-950/60 border-violet-700/40',
      status: 'coming-soon',
      action: () => comingSoon('AI Writer'),
    },
  ];

  const statusLabel: Record<AITool['status'], { text: string; cls: string }> = {
    'available': { text: 'Available', cls: 'text-teal-400 bg-teal-950/50 border-teal-700/40' },
    'opens-editor': { text: 'Opens Editor', cls: 'text-cyan-400 bg-cyan-950/40 border-cyan-700/40' },
    'coming-soon': { text: 'Coming Soon', cls: 'text-zinc-400 bg-zinc-800/60 border-zinc-700/40' },
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#070709] text-white p-4 sm:p-6 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-950/60 border border-violet-700/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Tools</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              All AI-powered features in one place. Click any tool to get started.
            </p>
          </div>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          {Object.entries(statusLabel).map(([key, val]) => (
            <span key={key} className={`px-2 py-0.5 rounded-full border font-semibold ${val.cls}`}>
              {val.text}
            </span>
          ))}
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const badge = statusLabel[tool.status];
            return (
              <button
                key={tool.id}
                onClick={tool.action}
                className={`text-left p-4 rounded-2xl border transition-all duration-150 group flex flex-col gap-3 ${
                  tool.status === 'coming-soon'
                    ? 'bg-zinc-900/40 border-zinc-800/60 opacity-70 cursor-not-allowed'
                    : 'bg-[#111116] hover:bg-[#16161f] border-zinc-800/80 hover:border-zinc-700 cursor-pointer hover:shadow-lg hover:shadow-black/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${tool.iconBg}`}>
                    <Icon className={`w-4.5 h-4.5 ${tool.iconColor}`} />
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${badge.cls}`}>
                    {badge.text}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    {tool.label}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{tool.description}</p>
                </div>

                {/* Action CTA Button matching reference image */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {tool.status === 'available' ? 'Ready to use' : tool.status === 'opens-editor' ? 'In Editor' : 'Cloud AI'}
                  </span>
                  {tool.status !== 'coming-soon' ? (
                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 group-hover:brightness-110">
                      <span>Open</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-500 text-[10px] font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-zinc-600 text-center pb-4">
          "Coming Soon" tools require cloud AI configuration. All other tools are fully functional.
        </p>
      </div>
    </div>
  );
};

export default AIToolsScreen;
