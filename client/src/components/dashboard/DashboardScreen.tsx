import React, { useState } from 'react';
import {
  Wand2,
  PlusSquare,
  Layers,
  Type,
  Mic,
  MoreVertical,
  ArrowRight,
  Sparkles,
  HardDrive,
  Play,
  X,
  Film,
  Eye,
  Heart,
  Image,
  Scissors,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { TextToVideoModal } from '../modals/TextToVideoModal.js';
import { AIVoiceModal } from '../modals/AIVoiceModal.js';

interface TrendingItem {
  id: string;
  name: string;
  category: string;
  aspectRatio: string;
  duration: string;
  views: string;
  likes: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  tagColor: string;
  glowClass: string;
}

const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 'tmpl-ready-cinematic-vibes',
    name: 'Cinematic Vibes',
    category: 'Cinematic',
    aspectRatio: '9:16',
    duration: '0:15',
    views: '125K',
    likes: '4.3K',
    thumbnailUrl: '/thumbnails/poster-cinematic.svg',
    videoUrl: '/seeds/ready_cinematic_vibes.mp4',
    description: 'Breathtaking urban skyline with dramatic contrast and cinematic pacing.',
    tagColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    glowClass: 'glow-cinematic',
  },
  {
    id: 'tmpl-ready-love-story',
    name: 'Love Story',
    category: 'Love Story',
    aspectRatio: '9:16',
    duration: '0:12',
    views: '89K',
    likes: '3.2K',
    thumbnailUrl: '/thumbnails/poster-love.svg',
    videoUrl: '/seeds/ready_love_story.mp4',
    description: 'Gentle silhouette by the water with warm emotive tones.',
    tagColor: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    glowClass: 'glow-love',
  },
  {
    id: 'tmpl-ready-travel-diaries',
    name: 'Travel Diaries',
    category: 'Travel',
    aspectRatio: '16:9',
    duration: '0:16',
    views: '76K',
    likes: '2.9K',
    thumbnailUrl: '/thumbnails/poster-travel.svg',
    videoUrl: '/seeds/ready_travel_diaries.mp4',
    description: 'Coastal highway road trip through breathtaking panoramic cliffs.',
    tagColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
    glowClass: 'glow-travel',
  },
  {
    id: 'tmpl-ready-dark-aesthetic',
    name: 'Dark Aesthetic',
    category: 'Dark Aesthetic',
    aspectRatio: '9:16',
    duration: '0:16',
    views: '64K',
    likes: '2.4K',
    thumbnailUrl: '/thumbnails/poster-dark.svg',
    videoUrl: '/seeds/ready_dark_aesthetic.mp4',
    description: 'Moody film noir portrait reel with deep shadows and specular highlights.',
    tagColor: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    glowClass: 'glow-dark',
  },
  {
    id: 'tmpl-ready-nature-escape',
    name: 'Nature Escape',
    category: 'Nature',
    aspectRatio: '16:9',
    duration: '0:14',
    views: '52K',
    likes: '2.1K',
    thumbnailUrl: '/thumbnails/poster-nature.svg',
    videoUrl: '/seeds/ready_nature_escape.mp4',
    description: 'Lush alpine peaks and tranquil mountain valleys with acoustic harmony.',
    tagColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    glowClass: 'glow-nature',
  },
  {
    id: 'tmpl-ready-slow-motion',
    name: 'Slow Motion',
    category: 'Slow Motion',
    aspectRatio: '9:16',
    duration: '0:10',
    views: '30K',
    likes: '1.8K',
    thumbnailUrl: '/thumbnails/poster-slowmo.svg',
    videoUrl: '/seeds/ready_slow_motion.mp4',
    description: 'High-speed action silhouette jump suspended in crystal slow motion.',
    tagColor: 'bg-violet-950/80 text-violet-300 border-violet-700/60',
    glowClass: 'glow-slowmo',
  },
];

interface RecentProjectItem {
  id: string;
  title: string;
  category: string;
  aspectRatio: string;
  dateStr: string;
  duration: string;
  thumbnailUrl: string;
}

const RECENT_PROJECTS_DATA: RecentProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Travel Vlog',
    category: 'Travel',
    aspectRatio: '16:9',
    dateStr: '2 days ago',
    duration: '0:35',
    thumbnailUrl: '/thumbnails/recent-travel-vlog.svg',
  },
  {
    id: 'proj-2',
    title: 'Product Promo',
    category: 'Commercial',
    aspectRatio: '9:16',
    dateStr: '4 days ago',
    duration: '0:15',
    thumbnailUrl: '/thumbnails/recent-product-promo.svg',
  },
  {
    id: 'proj-3',
    title: 'Wedding Story',
    category: 'Wedding',
    aspectRatio: '16:9',
    dateStr: '1 week ago',
    duration: '0:48',
    thumbnailUrl: '/thumbnails/recent-wedding-story.svg',
  },
  {
    id: 'proj-4',
    title: 'Nature Escape',
    category: 'Nature',
    aspectRatio: '16:9',
    dateStr: '1 week ago',
    duration: '0:24',
    thumbnailUrl: '/thumbnails/recent-nature-escape.svg',
  },
  {
    id: 'proj-5',
    title: 'Gaming Highlight',
    category: 'Gaming',
    aspectRatio: '9:16',
    dateStr: '2 weeks ago',
    duration: '1:12',
    thumbnailUrl: '/thumbnails/recent-gaming-highlight.svg',
  },
];

export const DashboardScreen: React.FC = () => {
  const {
    projects,
    setActiveSection,
    createNewProject,
    loadProject,
    applyTemplate,
    addToast,
  } = useAppStore();

  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<TrendingItem | null>(null);
  const [isTextToVideoOpen, setIsTextToVideoOpen] = useState(false);
  const [isAIVoiceOpen, setIsAIVoiceOpen] = useState(false);

  // Photo Editor: open editor in image mode — creates a new project
  // with a toast directing user to the Photo/Image panel
  const handlePhotoEditor = () => {
    createNewProject('1:1');
    addToast({
      type: 'info',
      title: 'Photo Editor',
      description: 'Project created. Select the "Photo" tab in the left panel to add and edit images.',
    });
  };

  // Background Removal: open editor with BG removal panel
  const handleBGRemoval = () => {
    createNewProject('16:9');
    addToast({
      type: 'info',
      title: 'Background Removal',
      description: 'Upload an image or video clip, then select "Background Removal" from the left panel.',
    });
  };

  const handleUseTemplate = async (template: TrendingItem) => {
    await applyTemplate(template.id);
    setSelectedPreviewTemplate(null);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#070709] text-white p-4 sm:p-5 lg:p-6 select-none">
      {/* 2-Column Responsive Layout: Center Main Feed (8 or 9 cols) + Right Column (3 or 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 max-w-[1680px] mx-auto">
        {/* ============================================================ */}
        {/* MIDDLE COLUMN: Hero Banner, Quick Actions, Trending, Projects */}
        {/* ============================================================ */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          {/* 1. HERO BANNER */}
          <div className="relative rounded-2xl bg-[#09090d] border border-white/10 p-6 sm:p-7 overflow-hidden shadow-2xl">
            {/* Cinematic Traveler Sunset Mountain Backdrop (Panel 3 Reference) */}
            <div className="absolute inset-0 z-0">
              <img
                src="/thumbnails/hero-traveler-sunset.svg"
                alt="Create Something Amazing"
                className="w-full h-full object-cover object-right md:object-center opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/70 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 min-h-[160px]">
              <div className="space-y-3 max-w-xl">
                {/* Large Metallic Emblem + Title */}
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    <path d="M16 3L4 27H11L16 16L21 27H28L16 3Z" fill="url(#heroGradAura)" />
                    <path d="M16 10L10 23H13L16 17L19 23H22L16 10Z" fill="#070709" />
                    <defs>
                      <linearGradient id="heroGradAura" x1="4" y1="3" x2="28" y2="27" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ffffff" />
                        <stop offset="0.4" stopColor="#e4e4e7" />
                        <stop offset="0.6" stopColor="#71717a" />
                        <stop offset="0.85" stopColor="#f4f4f5" />
                        <stop offset="1" stopColor="#a1a1aa" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white leading-none">
                      AURA
                    </h1>
                    <span className="text-[9px] font-bold tracking-[0.3em] text-zinc-400 uppercase block mt-0.5">
                      VIDEO PRO
                    </span>
                  </div>
                </div>

                {/* Headline: Turn Your Ideas Into Stunning Videos */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Turn Your Ideas Into <br className="hidden sm:inline" />
                  <span className="font-serif italic font-normal text-white">Stunning</span> Videos
                </h2>

                <p className="text-xs sm:text-sm text-zinc-400 font-medium tracking-wide">
                  Edit • Enhance • Create • Share
                </p>

                {/* Two Action Buttons side-by-side */}
                <div className="flex items-center gap-3 pt-2">
                  {/* Button 1: Solid Vibrant Electric Cyan + New Project */}
                  <button
                    onClick={() => createNewProject('16:9')}
                    className="px-6 py-2.5 rounded-full bg-[#22D3EE] hover:bg-[#67e8f9] text-zinc-950 font-extrabold text-xs tracking-wide shadow-[0_0_22px_rgba(34,211,238,0.5)] transition-all flex items-center gap-2 active:scale-95 group"
                  >
                    <span className="text-sm font-black">+</span>
                    <span>New Project</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-950 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Button 2: Modern Glassy Aura Auto Editor with Violet Glow */}
                  <button
                    onClick={() => setActiveSection('autoedit')}
                    className="px-6 py-2.5 rounded-full bg-[#181824]/90 hover:bg-[#202032] border border-violet-500/70 hover:border-violet-400 text-violet-200 hover:text-white font-semibold text-xs tracking-wide shadow-[0_0_18px_rgba(167,139,250,0.3)] transition-all backdrop-blur-md flex items-center gap-2 active:scale-95 group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                    <span>Aura Auto Editor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. QUICK TOOLS (6 CARDS IN A ROW MATCHING REFERENCE) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-sm">⚡</span>
                <h3 className="text-sm font-bold text-white tracking-wide">Quick Tools</h3>
              </div>
              <button
                onClick={() => setActiveSection('templates')}
                className="text-xs text-zinc-400 hover:text-cyan-300 transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Card 1: Auto Editor — Violet/Cyan theme */}
              <div
                onClick={() => setActiveSection('autoedit')}
                className="rounded-xl bg-[#12121a] hover:bg-[#181824] border border-violet-800/60 hover:border-violet-400/80 hover:shadow-[0_0_18px_rgba(167,139,250,0.3)] p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between h-24 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-violet-950/70 border border-violet-600/60 flex items-center justify-center text-violet-300 group-hover:scale-105 transition-transform">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/50 text-[8px] font-extrabold uppercase tracking-wider">
                    AI
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-violet-200">Auto Editor</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">AI powered cuts →</div>
                </div>
              </div>

              {/* Card 2: Text to Video — Bright Blue/Cyan theme */}
              <div
                onClick={() => setIsTextToVideoOpen(true)}
                className="rounded-xl bg-[#12121a] hover:bg-[#151926] border border-blue-900/60 hover:border-blue-400/80 hover:shadow-[0_0_18px_rgba(96,165,250,0.3)] p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between h-24 group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-950/70 border border-blue-600/60 flex items-center justify-center text-blue-300 group-hover:scale-105 transition-transform">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-200">Text to Video</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Turn text into video →</div>
                </div>
              </div>

              {/* Card 3: Photo Editor — Pink/Magenta theme */}
              <div
                onClick={handlePhotoEditor}
                className="rounded-xl bg-[#12121a] hover:bg-[#201520] border border-pink-900/60 hover:border-pink-400/80 hover:shadow-[0_0_18px_rgba(244,114,182,0.3)] p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between h-24 group"
              >
                <div className="w-7 h-7 rounded-lg bg-pink-950/70 border border-pink-600/60 flex items-center justify-center text-pink-300 group-hover:scale-105 transition-transform">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-pink-200">Photo Editor</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Edit your images →</div>
                </div>
              </div>

              {/* Card 4: AI Writer — Luminous Violet theme */}
              <div
                onClick={() => setActiveSection('ai_tools')}
                className="rounded-xl bg-[#12121a] hover:bg-[#1a1524] border border-purple-900/60 hover:border-purple-400/80 hover:shadow-[0_0_18px_rgba(168,85,247,0.3)] p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between h-24 group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-950/70 border border-purple-600/60 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-200">AI Writer</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Generate scripts →</div>
                </div>
              </div>

              {/* Card 5: Background Removal — Teal/Cyan theme */}
              <div
                onClick={handleBGRemoval}
                className="rounded-xl bg-[#12121a] hover:bg-[#121f1f] border border-teal-900/60 hover:border-teal-400/80 hover:shadow-[0_0_18px_rgba(45,212,191,0.3)] p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between h-24 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-950/70 border border-teal-600/60 flex items-center justify-center text-teal-300 group-hover:scale-105 transition-transform">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-teal-200">Background Removal</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Remove backgrounds →</div>
                </div>
              </div>

              {/* Card 6: AI Tools — Royal Indigo/Violet theme */}
              <div
                onClick={() => setActiveSection('ai_tools')}
                className="rounded-xl bg-[#12121a] hover:bg-[#171729] border border-indigo-900/60 hover:border-indigo-400/80 hover:shadow-[0_0_18px_rgba(99,102,241,0.3)] p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between h-24 group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-950/70 border border-indigo-600/60 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-200">AI Tools</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">More creative tools →</div>
                </div>
              </div>
            </div>

          </div>

          {/* 3. RECENT PROJECTS — THEMED COLORFUL PROJECT COVERS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🕒</span>
                <h3 className="text-sm font-bold text-white tracking-wide">Recent Projects</h3>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[9px] font-bold text-zinc-300">
                  {RECENT_PROJECTS_DATA.length} Files
                </span>
              </div>
              <button
                onClick={() => setActiveSection('projects')}
                className="text-xs text-zinc-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {RECENT_PROJECTS_DATA.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    const found = projects.find((p) => p.id === proj.id);
                    if (found) {
                      loadProject(proj.id);
                    } else {
                      createNewProject(proj.aspectRatio === '9:16' ? '9:16' : proj.aspectRatio === '1:1' ? '1:1' : '16:9');
                    }
                  }}
                  className="rounded-2xl bg-[#111118] hover:bg-[#161622] border border-zinc-800/90 hover:border-zinc-600/90 p-2.5 cursor-pointer transition-all duration-200 flex flex-col justify-between group overflow-hidden shadow-md hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl bg-black overflow-hidden mb-2.5">
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

                    {/* Aspect Ratio Badge (Colored) */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-1.5 py-0.5 rounded-md border text-[8.5px] font-mono font-bold shadow-sm backdrop-blur-md ${
                        proj.aspectRatio === '16:9'
                          ? 'bg-cyan-950/85 text-cyan-300 border-cyan-600/70'
                          : proj.aspectRatio === '9:16'
                          ? 'bg-pink-950/85 text-pink-300 border-pink-600/70'
                          : 'bg-amber-950/85 text-amber-300 border-amber-600/70'
                      }`}>
                        {proj.aspectRatio}
                      </span>
                    </div>

                    {/* Resolution / Duration Badge top-right */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-zinc-700/80 text-[8.5px] font-mono font-bold text-zinc-300">
                      {proj.aspectRatio === '9:16' ? '1080P' : '4K'}
                    </div>

                    {/* Duration badge bottom-right */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[8.5px] font-mono text-zinc-200 border border-white/10">
                      {proj.duration}
                    </div>

                    {/* Centered play icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors pr-1">
                        {proj.title}
                      </div>
                      <MoreVertical className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
                      <span className="text-zinc-400">{proj.category}</span>
                      <span className="font-mono text-zinc-500">{proj.dateStr}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. TRENDING TEMPLATES — ART-DIRECTED CINEMATIC POSTER CARDS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <h3 className="text-sm font-bold text-white tracking-wide">Trending Templates</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/60 text-[9px] font-extrabold text-cyan-300 uppercase tracking-wider">
                  Featured
                </span>
              </div>
              <button
                onClick={() => setActiveSection('templates')}
                className="text-xs text-zinc-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1"
              >
                <span>Explore All</span>
                <span>→</span>
              </button>
            </div>

            {/* Poster Grid: 6 Distinctly Themed Full-Bleed Posters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {TRENDING_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPreviewTemplate(item)}
                  className={`group relative rounded-2xl bg-[#0e0e14] border border-white/10 hover:border-white/30 overflow-hidden transition-all duration-200 cursor-pointer shadow-lg hover:-translate-y-1 ${item.glowClass}`}
                >
                  {/* Full-Bleed Poster Container (Cinematic 10:14 Ratio) */}
                  <div className="relative aspect-[10/14] w-full overflow-hidden">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Art-Directed Dark Gradients & Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-black/20 to-black/60 pointer-events-none" />

                    {/* Top Bar: Category Pill & Metadata */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md ${item.tagColor}`}>
                        {item.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[8px] font-mono text-zinc-300 border border-white/10">
                        {item.aspectRatio}
                      </span>
                    </div>

                    {/* Center Circular Play Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/60 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Metadata & Title inside Poster */}
                    <div className="absolute bottom-0 inset-x-0 p-3 pt-6 bg-gradient-to-t from-black via-black/85 to-transparent">
                      <h4 className="text-xs font-bold text-white tracking-tight leading-snug group-hover:text-cyan-200 transition-colors truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between text-[9.5px] text-zinc-300 mt-1">
                        <span className="font-mono text-zinc-400">{item.duration}</span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Eye className="w-2.5 h-2.5" />
                          <span>{item.views}</span>
                        </span>
                      </div>
                      {/* Hover action banner */}
                      <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center justify-between text-[9.5px]">
                        <span className="text-zinc-400">Preview</span>
                        <span className="font-bold text-cyan-300 group-hover:text-cyan-200 flex items-center gap-0.5">
                          Use Template →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Popular Templates (top) + AI Auto Editor (bottom) */}
        {/* ============================================================ */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-4">
          {/* 1. POPULAR TEMPLATES (2x2 GRID WITH THEMED POSTERS) */}
          <div className="rounded-2xl bg-[#101016] border border-zinc-800/90 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-pink-400 text-sm">✨</span>
                <h4 className="text-xs font-bold text-white tracking-wide">Popular Templates</h4>
              </div>
              <button
                onClick={() => setActiveSection('templates')}
                className="text-[11px] text-zinc-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-0.5"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {/* 2x2 Grid with vibrant category posters */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Cinematic Vibes', tag: 'Cinematic', tagColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60', glowClass: 'glow-cinematic', img: '/thumbnails/poster-cinematic.svg', duration: '0:15' },
                { name: 'Travel Diaries', tag: 'Travel', tagColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60', glowClass: 'glow-travel', img: '/thumbnails/poster-travel.svg', duration: '0:16' },
                { name: 'Fashion Reel', tag: 'Fashion', tagColor: 'bg-pink-950/80 text-pink-300 border-pink-700/60', glowClass: 'glow-fashion', img: '/thumbnails/poster-fashion.svg', duration: '0:18' },
                { name: 'Sports Motion', tag: 'Sports', tagColor: 'bg-orange-950/80 text-orange-300 border-orange-700/60', glowClass: 'glow-sports', img: '/thumbnails/poster-sports.svg', duration: '0:14' },
              ].map((tmpl) => (
                <div
                  key={tmpl.name}
                  onClick={() => setActiveSection('templates')}
                  className={`rounded-xl bg-[#14141d] hover:bg-[#1a1a26] border border-zinc-800/90 hover:border-zinc-600/90 p-2 cursor-pointer transition-all duration-200 group overflow-hidden ${tmpl.glowClass}`}
                >
                  <div className="relative aspect-[4/3] rounded-lg bg-black overflow-hidden mb-2">
                    <img
                      src={tmpl.img}
                      alt={tmpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
                    
                    {/* Category pill */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[7.5px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm ${tmpl.tagColor}`}>
                        {tmpl.tag}
                      </span>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-black/80 backdrop-blur-md text-[7.5px] font-mono text-zinc-300 border border-white/10">
                      {tmpl.duration}
                    </div>

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/50 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-cyan-200 block truncate">
                    {tmpl.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. AI AUTO EDITOR BANNER (MATCHING SCREENSHOT) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1a1429] via-[#151322] to-[#0f111c] border border-violet-500/40 p-5 space-y-3.5 shadow-2xl relative overflow-hidden group">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-violet-950/80 border border-violet-500/50 flex items-center justify-center text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.3)]">
                  <Wand2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide">AI Auto Editor</h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Let AI edit your clips into a professional video in seconds.
              </p>
            </div>

            {/* Try Now Button — Electric Cyan */}
            <button
              onClick={() => setActiveSection('autoedit')}
              className="relative z-10 w-full py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#67e8f9] text-zinc-950 font-extrabold text-xs tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.45)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Try Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
            </button>
          </div>

          {/* 3. STORAGE & STATUS */}
          <div className="rounded-2xl bg-[#101016] border border-zinc-800/90 p-4 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloud Storage</span>
              </div>
              <button
                onClick={() => setActiveSection('media')}
                className="text-[11px] text-zinc-400 hover:text-cyan-300 transition-colors"
              >
                Manage →
              </button>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 pt-0.5">
              <span>Used: 2.4 GB</span>
              <span>Total: 10 GB</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-zinc-850 overflow-hidden">
              <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>
          </div>

          {/* 3. STORAGE PROGRESS CARD */}
          <div className="rounded-2xl bg-[#111116] border border-zinc-800/90 p-4 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                <span>Storage</span>
              </div>
              <button
                onClick={() => setActiveSection('media')}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                Manage →
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-400">
              2.4 GB / 10 GB
            </div>

            {/* Glowing progress bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* READY-MADE VIDEO TEMPLATE PREVIEW MODAL */}
      {/* ============================================================ */}
      {selectedPreviewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#111116] border border-zinc-800 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedPreviewTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px] font-bold tracking-wider uppercase">
                READY VIDEO
              </span>
              <h2 className="text-lg font-bold text-white">{selectedPreviewTemplate.name}</h2>
            </div>

            {/* Playable Video Player */}
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-zinc-800 shadow-inner">
              <video
                src={selectedPreviewTemplate.videoUrl}
                autoPlay
                controls
                className="w-full h-full object-contain"
              />
            </div>

            {/* Description & Metadata */}
            <div className="space-y-1">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedPreviewTemplate.description}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1 font-mono">
                <span>Duration: {selectedPreviewTemplate.duration}</span>
                <span>•</span>
                <span>Views: {selectedPreviewTemplate.views}</span>
                <span>•</span>
                <span>Likes: {selectedPreviewTemplate.likes}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPreviewTemplate(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleUseTemplate(selectedPreviewTemplate)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg shadow-white/10 transition-all active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>Open in Project Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <TextToVideoModal
        isOpen={isTextToVideoOpen}
        onClose={() => setIsTextToVideoOpen(false)}
      />
      <AIVoiceModal
        isOpen={isAIVoiceOpen}
        onClose={() => setIsAIVoiceOpen(false)}
      />
    </div>
  );
};
export default DashboardScreen;
