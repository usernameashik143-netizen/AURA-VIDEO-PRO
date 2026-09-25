import React from 'react';
import {
  LayoutDashboard,
  Layers,
  HardDrive,
  UserCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { AppSection } from '../../types/index.js';

// 4 tabs matching reference image: Home | Templates | Library | Me
const MOBILE_ITEMS: Array<{ id: AppSection; label: string; icon: React.ElementType; color: string }> = [
  { id: 'dashboard',  label: 'Home',      icon: LayoutDashboard, color: 'text-cyan-400' },
  { id: 'templates',  label: 'Templates', icon: Layers,          color: 'text-pink-400' },
  { id: 'media',      label: 'Library',   icon: HardDrive,       color: 'text-blue-400' },
  { id: 'settings',   label: 'Me',        icon: UserCircle,      color: 'text-amber-400' },
];

export const MobileNav: React.FC = () => {
  const { activeSection, setActiveSection } = useAppStore();

  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      {/* Floating Capsule Liquid Glass Container matching reference screenshot */}
      <nav className="pointer-events-auto flex items-center gap-1.5 bg-[#0e0e14]/90 backdrop-blur-2xl border border-zinc-700/70 rounded-full px-3 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)]">
        {MOBILE_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-[0_0_18px_rgba(34,211,238,0.5)] px-4 py-2 rounded-full'
                  : 'text-zinc-400 hover:text-white px-3 py-2 rounded-full hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color} transition-colors`} />
              <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;
