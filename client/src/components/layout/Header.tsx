import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Settings,
  Minus,
  Square,
  X,
  Sparkles,
  Film,
  Layers,
  ArrowRight,
  Music,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { AppSection } from '../../types/index.js';

export const Header: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    projects,
    audioLibrary,
    addToast,
    loadProject,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? [
        ...projects
          .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map((p) => ({ type: 'project' as const, id: p.id, title: p.title, subtitle: 'Project' })),
        ...audioLibrary
          .filter((a) => (a.name || a.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 3)
          .map((a) => ({ type: 'audio' as const, id: a.id, title: a.name || a.title || 'Audio Track', subtitle: `BGM • ${a.category}` })),
      ]
    : [];

  const handleSearchResultClick = (item: any) => {
    if (item.type === 'project') {
      loadProject(item.id);
    } else if (item.type === 'audio') {
      setActiveSection('audio');
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="h-12 px-4 sm:px-6 bg-[#070709] border-b border-[#16161c] flex items-center justify-between z-40 select-none shrink-0 relative overflow-hidden">
      {/* Liquid Metal Wave Ribbon Background Across Header */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg
          viewBox="0 0 1600 48"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M-50 15 C 200 -10, 450 60, 700 15 C 950 -20, 1200 50, 1650 20"
            stroke="url(#hdrLiquidGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="blur(5px)"
          />
          <path
            d="M-30 25 C 220 5, 470 50, 720 22 C 970 -5, 1220 40, 1630 25"
            stroke="url(#hdrLiquidGradWhite)"
            strokeWidth="1.5"
            filter="blur(1px)"
          />
          <defs>
            <linearGradient id="hdrLiquidGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#71717a" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#e4e4e7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3f3f46" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="hdrLiquidGradWhite" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#d4d4d8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 1. Left: Metallic Brand Emblem & Title */}
      <div
        onClick={() => setActiveSection('dashboard')}
        className="flex items-center gap-3 cursor-pointer group shrink-0 relative z-10"
      >
        {/* Geometric Chrome 'A' Emblem */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="w-7 h-7 transform group-hover:scale-105 transition-transform drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
          >
            <path
              d="M16 3L4 27H11L16 16L21 27H28L16 3Z"
              fill="url(#headerChromeGrad)"
            />
            <path
              d="M16 10L10 23H13L16 17L19 23H22L16 10Z"
              fill="#070709"
            />
            <defs>
              <linearGradient id="headerChromeGrad" x1="4" y1="3" x2="28" y2="27" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.4" stopColor="#e4e4e7" />
                <stop offset="0.6" stopColor="#71717a" />
                <stop offset="0.85" stopColor="#f4f4f5" />
                <stop offset="1" stopColor="#a1a1aa" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex flex-col justify-center leading-none">
          <span className="text-sm font-black tracking-wider text-white">
            AURA
          </span>
          <span className="text-[8px] font-bold tracking-[0.25em] text-zinc-400 uppercase mt-0.5">
            VIDEO PRO
          </span>
        </div>
      </div>

      {/* 2. Center: Pill Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-lg mx-6 hidden sm:block z-10">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search templates, effects, or anything..."
            className="w-full h-8 pl-9 pr-4 rounded-full bg-[#131318]/90 hover:bg-[#16161d] focus:bg-[#181822] border border-zinc-800 focus:border-zinc-500 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Real-time Search Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-10 left-0 right-0 rounded-xl bg-[#121217] border border-zinc-700/80 shadow-2xl overflow-hidden z-50 divide-y divide-zinc-800">
            {searchResults.length > 0 ? (
              searchResults.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleSearchResultClick(item)}
                  className="px-4 py-2.5 hover:bg-[#1c1c24] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {item.type === 'project' ? (
                      <Film className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <Music className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-white">{item.title}</div>
                      <div className="text-[10px] text-zinc-500">{item.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-500" />
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-zinc-500 text-center">
                No matching results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Right: Bell, Settings, Avatar, Window Controls */}
      <div className="flex items-center gap-3 relative z-10">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-9 w-64 rounded-xl bg-[#121217] border border-zinc-800 p-3 shadow-2xl z-50 text-xs space-y-2">
              <div className="font-bold text-white border-b border-zinc-800 pb-1.5">Notifications</div>
              <div className="text-[11px] text-zinc-400">All video engines & GPU render nodes are active.</div>
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <button
          onClick={() => setActiveSection('settings')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          title="Studio Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Creator Profile Pill with Green Online Dot */}
        <div
          onClick={() => setActiveSection('settings')}
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-[#14141e] hover:bg-[#1c1c28] border border-zinc-700/80 hover:border-cyan-500/50 cursor-pointer transition-all shadow-sm group"
          title="Account Profile (Settings)"
        >
          <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-violet-500 p-[1px]">
            <div className="w-full h-full rounded-full bg-[#121218] flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Creator"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {/* Green Online Dot */}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0a0a0f] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 transition-colors hidden sm:inline">
            Creator
          </span>
        </div>

        {/* Desktop Window Controls (Minimize, Maximize, Close) */}
        <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-zinc-800 text-zinc-500">
          <button
            onClick={() => addToast({ type: 'info', title: 'Window Minimized' })}
            className="p-1 hover:text-white hover:bg-zinc-800/80 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => addToast({ type: 'info', title: 'Window Maximized' })}
            className="p-1 hover:text-white hover:bg-zinc-800/80 rounded transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => addToast({ type: 'info', title: 'Aura Video Pro Studio is running.' })}
            className="p-1 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
