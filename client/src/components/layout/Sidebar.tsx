import React from 'react';
import {
  Home,
  Wand2,
  PlusSquare,
  Layers,
  Folder,
  Sparkles,
  Stars,
  ArrowLeftRight,
  Music,
  Image,
  Settings,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { AppSection } from '../../types/index.js';

interface SidebarItem {
  id: AppSection | 'createnew';
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  color: string;
  activeClass: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: Home,
    color: 'text-cyan-400',
    activeClass: 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.25)] font-semibold',
  },
  {
    id: 'autoedit',
    label: 'AI Auto Editor',
    icon: Wand2,
    badge: 'NEW',
    badgeColor: 'bg-violet-950/80 text-violet-300 border border-violet-600/60 shadow-[0_0_8px_rgba(167,139,250,0.3)]',
    color: 'text-violet-400',
    activeClass: 'bg-violet-500/20 text-violet-200 border border-violet-400/50 shadow-[0_0_15px_rgba(167,139,250,0.25)] font-semibold',
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Layers,
    color: 'text-pink-400',
    activeClass: 'bg-pink-500/20 text-pink-200 border border-pink-400/50 shadow-[0_0_15px_rgba(244,114,182,0.25)] font-semibold',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Folder,
    color: 'text-amber-400',
    activeClass: 'bg-amber-500/20 text-amber-200 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.25)] font-semibold',
  },
  {
    id: 'media',
    label: 'Media Library',
    icon: Image,
    color: 'text-blue-400',
    activeClass: 'bg-blue-500/20 text-blue-200 border border-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.25)] font-semibold',
  },
  {
    id: 'ai_tools',
    label: 'AI Tools',
    icon: Sparkles,
    color: 'text-violet-400',
    activeClass: 'bg-violet-500/20 text-violet-200 border border-violet-400/50 shadow-[0_0_15px_rgba(167,139,250,0.25)] font-semibold',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    color: 'text-zinc-400',
    activeClass: 'bg-zinc-800 text-white border border-zinc-700 shadow-md font-semibold',
  },
];

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, createNewProject } = useAppStore();

  const handleNavClick = (item: SidebarItem) => {
    if (item.id === 'createnew') {
      createNewProject('16:9');
    } else {
      setActiveSection(item.id as AppSection);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-56 h-full bg-[#0a0a0f] border-r border-[#1a1a24] z-30 select-none shrink-0 py-4 px-3 justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-cyan-500/5 via-violet-500/5 to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="px-2 pb-4 mb-1 border-b border-zinc-800/80 flex items-center gap-2.5 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-400 blur-sm opacity-50" />
          <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 relative drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            <path d="M16 3L4 27H11L16 16L21 27H28L16 3Z" fill="url(#sideNavGradAura)" />
            <path d="M16 10L10 23H13L16 17L19 23H22L16 10Z" fill="#0a0a0f" />
            <defs>
              <linearGradient id="sideNavGradAura" x1="4" y1="3" x2="28" y2="27" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.4" stopColor="#22D3EE" />
                <stop offset="1" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <span className="text-xs font-black tracking-wider text-white block leading-tight">
            AURA
          </span>
          <span className="text-[7.5px] font-bold tracking-[0.25em] text-cyan-400 uppercase block">
            VIDEO PRO
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 relative z-10 flex-1 overflow-y-auto no-scrollbar pt-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = item.id === 'createnew' ? false : activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? `${item.activeClass} font-semibold`
                  : 'text-zinc-400 hover:text-white hover:bg-[#14141e] hover:border-l-2 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : `${item.color} group-hover:brightness-125`
                  }`}
                />
                <span className={isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded uppercase tracking-wider ${
                    item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Tagline */}
      <div className="px-3 pt-3 pb-1 text-center border-t border-zinc-800/80 relative z-10">
        <p className="text-[11px] text-zinc-300 font-serif italic tracking-wide">
          "Create. Edit. Share."
        </p>
        <p className="text-[8.5px] text-cyan-400 font-mono font-bold tracking-[0.25em] mt-0.5 uppercase">
          AURA STUDIO
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
