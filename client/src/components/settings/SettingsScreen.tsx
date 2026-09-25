import React, { useState } from 'react';
import {
  User,
  Palette,
  Bell,
  HardDrive,
  HelpCircle,
  Info,
  LogOut,
  Cpu,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';

export const SettingsScreen: React.FC = () => {
  const { addToast } = useAppStore();

  const [defaultAspect, setDefaultAspect] = useState('16:9');
  const [autoSaveInterval, setAutoSaveInterval] = useState('1m');
  const [aiEngineSensitivity, setAiEngineSensitivity] = useState('Balanced (Recommended)');
  const [activeMenuTab, setActiveMenuTab] = useState<'account' | 'appearance' | 'notifications' | 'storage' | 'help' | 'about'>('account');

  const handleSave = () => {
    addToast({
      type: 'success',
      title: 'Preferences Updated',
      description: 'System settings saved successfully.',
    });
  };

  const handleClearCache = () => {
    addToast({
      type: 'info',
      title: 'Cache Purged',
      description: 'Temporary preview frames and waveforms cleared.',
    });
  };

  const handleSignOutNotice = () => {
    addToast({
      type: 'info',
      title: 'Sign Out',
      description: 'Local guest session active. No persistent cloud account connected.',
    });
  };

  const SETTINGS_MENU = [
    { id: 'account', label: 'Account', icon: User, color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-700/50' },
    { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-pink-400', bg: 'bg-pink-950/60 border-pink-700/50' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-violet-400', bg: 'bg-violet-950/60 border-violet-700/50' },
    { id: 'storage', label: 'Storage', icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-700/50' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-700/50' },
    { id: 'about', label: 'About', icon: Info, color: 'text-teal-400', bg: 'bg-teal-950/60 border-teal-700/50' },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07070a] p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings / Profile</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Manage your studio preferences, hardware settings and creator profile</p>
      </div>

      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Profile Card & Navigation matching reference */}
        <div className="md:col-span-5 space-y-4">
          {/* Creator Profile Card */}
          <div className="p-5 rounded-3xl bg-[#12121a] border border-zinc-700/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-violet-500 p-[2px] shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <div className="w-full h-full rounded-[14px] bg-[#121218] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt="Creator"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#121218] shadow-sm" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Creator</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-600/60 text-[9px] font-mono">
                    PRO
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">creator@aura.pro</p>
              </div>
            </div>
          </div>

          {/* Settings Menu List matching reference screenshot */}
          <div className="rounded-3xl bg-[#12121a] border border-zinc-800/90 overflow-hidden divide-y divide-zinc-850 shadow-xl">
            {SETTINGS_MENU.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenuTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenuTab(item.id as any)}
                  className={`w-full px-4 py-3.5 flex items-center justify-between text-xs transition-all ${
                    isActive
                      ? 'bg-zinc-800/80 text-white font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center border ${item.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              );
            })}
          </div>

          {/* Sign Out Button (Crimson accent matching reference) */}
          <button
            onClick={handleSignOutNotice}
            className="w-full py-3 rounded-2xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:text-rose-200 font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Side: Configuration & Details */}
        <div className="md:col-span-7 space-y-5">
          {/* General Preferences */}
          <div className="p-6 rounded-3xl bg-[#12121a] border border-zinc-800 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <Palette className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">Editor Defaults</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Default Project Aspect Ratio
                </label>
                <select
                  value={defaultAspect}
                  onChange={(e) => setDefaultAspect(e.target.value)}
                  className="w-full bg-[#181822] border border-zinc-700/80 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="16:9">16:9 Widescreen (YouTube / TV)</option>
                  <option value="9:16">9:16 Vertical (TikTok / Reels / Shorts)</option>
                  <option value="1:1">1:1 Square (Instagram Feed)</option>
                  <option value="4:5">4:5 Portrait</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Timeline Auto-Save Frequency
                </label>
                <select
                  value={autoSaveInterval}
                  onChange={(e) => setAutoSaveInterval(e.target.value)}
                  className="w-full bg-[#181822] border border-zinc-700/80 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="30s">Every 30 Seconds</option>
                  <option value="1m">Every 1 Minute</option>
                  <option value="5m">Every 5 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Processing Settings */}
          <div className="p-6 rounded-3xl bg-[#12121a] border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <Cpu className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">AI Analysis Engine</h3>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Cut Aggressiveness & Salience Threshold
              </label>
              <select
                value={aiEngineSensitivity}
                onChange={(e) => setAiEngineSensitivity(e.target.value)}
                className="w-full bg-[#181822] border border-zinc-700/80 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-400"
              >
                <option value="Aggressive">Aggressive (Tight pacing, maximum silence removal)</option>
                <option value="Balanced (Recommended)">Balanced (Recommended — retains speech & reactions)</option>
                <option value="Relaxed">Relaxed (Longer shot lengths, scenic focus)</option>
              </select>
            </div>
          </div>

          {/* Storage & Engine */}
          <div className="p-6 rounded-3xl bg-[#12121a] border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Storage & Hardware Engine</h3>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Local FFmpeg Accelerated Pipeline</div>
                <div className="text-[11px] text-zinc-400">FFmpeg with libx264, xfade & amix</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-[10px] font-bold">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-zinc-300">Clear Cache & Temporary Files</div>
                <div className="text-[11px] text-zinc-500">Free up local browser memory and waveforms</div>
              </div>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
              >
                Purge Cache
              </button>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
