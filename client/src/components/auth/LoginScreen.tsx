import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [showAuthNotice, setShowAuthNotice] = useState(false);

  const handleSignIn = () => {
    setShowAuthNotice(true);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#07070a] overflow-hidden">
      {/* Background Ambient Glow matching reference */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-gradient-to-b from-violet-600/15 via-cyan-500/15 to-transparent blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Brand Emblem */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 blur-lg opacity-40" />
            <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 relative drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]">
              <path d="M24 4L6 42H16L21 28H27L32 42H42L24 4Z" fill="url(#loginNeonGrad)" />
              <path d="M24 16L18 34H21L24 25L27 34H30L24 16Z" fill="#07070a" />
              <defs>
                <linearGradient id="loginNeonGrad" x1="6" y1="4" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase drop-shadow-md">
            Aura Video Pro
          </h1>
          <p className="text-[10px] tracking-[0.25em] text-cyan-300 font-semibold uppercase mt-0.5">
            Create • Edit • Share
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f15]/90 border border-zinc-700/60 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">
          {/* View Tab Switcher */}
          <div className="flex mb-6 rounded-2xl bg-zinc-900/90 p-1 border border-zinc-800">
            <button
              onClick={() => { setView('login'); setShowAuthNotice(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setView('signup'); setShowAuthNotice(false); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'signup'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(167,139,250,0.35)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {view === 'login'
                ? 'Sign in to continue your creative journey'
                : 'Join the next generation of creative video editing'}
            </p>
          </div>

          {/* Honest configuration state */}
          {showAuthNotice && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-950/40 border border-amber-600/50 shadow-sm animate-in fade-in duration-200">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <span>⚠️</span> Authentication is not configured
              </p>
              <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed">
                Local development mode: Click <strong className="text-white underline">Continue without account</strong> below to use the full studio.
              </p>
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                className="w-full bg-[#161620] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-300">
                  Password
                </label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => setShowAuthNotice(true)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#161620] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all pr-10 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button — Glowing Cyan Gradient */}
            <button
              onClick={handleSignIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_22px_rgba(34,211,238,0.45)] hover:shadow-[0_0_30px_rgba(34,211,238,0.65)] hover:brightness-105 active:scale-[0.98] mt-2"
            >
              {view === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Continue without account / Guest Button */}
          <button
            onClick={onContinueAsGuest}
            className="w-full py-3 rounded-xl bg-[#14141e] hover:bg-[#1c1c28] border border-zinc-700/80 hover:border-cyan-400/80 text-white font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 group shadow-md active:scale-[0.98]"
          >
            <span>Continue without account</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <p className="text-[10px] text-zinc-500 text-center mt-5 leading-normal">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
