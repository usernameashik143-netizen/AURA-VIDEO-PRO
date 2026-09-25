import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animate the loading bar to 100% over ~2s
    const start = performance.now();
    const duration = 2000;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onDone, 400);
        }, 200);
      }
    };

    requestAnimationFrame(tick);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07070a] transition-opacity duration-400 overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Cosmic Vibrant Neon Nebula Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] rounded-full bg-gradient-to-tr from-violet-600/20 via-fuchsia-600/15 to-cyan-500/20 blur-[130px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-t from-cyan-600/15 via-blue-600/10 to-transparent blur-[110px]" />
        {/* Subtle grid/ambient lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#07070a_80%)]" />
      </div>

      {/* Center Brand Identity */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Neon Vibrant Logo */}
        <div className="relative group">
          {/* Outer glow ring aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-fuchsia-500 blur-xl opacity-40 animate-pulse" />
          
          <svg
            viewBox="0 0 84 84"
            fill="none"
            className="w-24 h-24 relative drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]"
          >
            {/* Outer halo circle */}
            <circle cx="42" cy="42" r="39" stroke="url(#splashNeonRing)" strokeWidth="1.5" opacity="0.75" />
            {/* Geometric A Letterform with Cyan-Violet Gradient */}
            <path
              d="M42 14L17 66H27L33 52H51L57 66H67L42 14Z"
              fill="url(#splashNeonLogoGrad)"
            />
            {/* Inner negative space triangle */}
            <path
              d="M42 27L31 54H38L42 43L46 54H53L42 27Z"
              fill="#07070a"
            />
            <defs>
              <linearGradient id="splashNeonLogoGrad" x1="17" y1="14" x2="67" y2="66" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#22D3EE" />
                <stop offset="70%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
              <linearGradient id="splashNeonRing" x1="0" y1="0" x2="84" y2="84" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title & Taglines */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.2em] text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]">
            Aura Video Pro
          </h1>
          <p className="text-xs font-semibold tracking-[0.35em] text-cyan-300 uppercase mt-1">
            Create&nbsp;•&nbsp;Edit&nbsp;•&nbsp;Share
          </p>
          <p className="text-[10px] tracking-[0.25em] text-zinc-400 font-medium">
            Your Vision, Our Power.
          </p>
        </div>

        {/* Neon Progress Bar */}
        <div className="w-56 mt-4">
          <div className="h-[3px] bg-zinc-800/80 rounded-full overflow-hidden p-[1px] border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.7)] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-2.5 tracking-widest font-mono uppercase">
            Loading creative space...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
