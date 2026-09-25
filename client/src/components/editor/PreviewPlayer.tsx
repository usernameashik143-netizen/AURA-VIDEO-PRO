import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Gauge,
  Sparkles,
  Radio,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Repeat,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { formatTimecode } from '../../utils/time.js';

export const PreviewPlayer: React.FC = () => {
  const {
    currentProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
  } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElementsMap = useRef<Map<string, HTMLVideoElement>>(new Map());
  const audioElementsMap = useRef<Map<string, HTMLAudioElement>>(new Map());

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<'fit' | '50%' | '75%' | '100%' | '150%'>('fit');
  const [vuLevel, setVuLevel] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [showFramesMode, setShowFramesMode] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Audio VU Meter Animation
  useEffect(() => {
    if (!isPlaying || isMuted) {
      setVuLevel(0);
      return;
    }
    const interval = setInterval(() => {
      const base = volume * 75;
      const variation = (Math.sin(Date.now() / 100) * 15) + (Math.random() * 15);
      setVuLevel(Math.min(100, Math.max(12, Math.round(base + variation))));
    }, 70);
    return () => clearInterval(interval);
  }, [isPlaying, isMuted, volume]);

  const stepFrame = (frames: number) => {
    const fps = currentProject?.fps || 30;
    const frameDur = 1 / fps;
    const newTime = Math.max(0, Math.min(totalDuration, currentTime + frames * frameDur));
    setCurrentTime(parseFloat(newTime.toFixed(3)));
  };

  const totalDuration = currentProject?.duration || 10;
  const aspectRatio = currentProject?.aspectRatio || '16:9';

  // Aspect ratio styling
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[65vh]';
      case '1:1':
        return 'aspect-square max-h-[65vh]';
      case '4:5':
        return 'aspect-[4/5] max-h-[65vh]';
      default:
        return 'aspect-video max-h-[65vh]';
    }
  };

  // Extract all tracks
  const tracks = currentProject?.tracks || [];

  // Active video clips
  const allVideoClips = tracks
    .filter((t) => t.type === 'video' && !t.isHidden)
    .flatMap((t) => t.clips)
    .sort((a, b) => a.start - b.start);

  // Active text overlays
  const activeTextClips = tracks
    .filter((t) => t.type === 'text' && !t.isHidden)
    .flatMap((t) => t.clips)
    .filter((c) => currentTime >= c.start && currentTime <= c.start + c.duration);

  // Active stickers
  const activeStickers = tracks
    .filter((t) => (t.type === 'sticker' || t.name.includes('Sticker')) && !t.isHidden)
    .flatMap((t) => t.clips)
    .filter((c) => currentTime >= c.start && currentTime <= c.start + c.duration);

  // Active audio clips across all audio tracks
  const activeAudioClips = tracks
    .filter((t) => t.type === 'audio' && !t.isMuted)
    .flatMap((t) =>
      t.clips.map((c) => ({
        ...c,
        effectiveVolume: (c.volume ?? 0.8) * (t.volume ?? 1),
      }))
    )
    .filter((c) => currentTime >= c.start && currentTime <= c.start + c.duration);

  // Primary clip and transition detection
  let primaryClip = null as (typeof allVideoClips)[0] | null;
  let nextClip = null as (typeof allVideoClips)[0] | null;
  let inTransition = false;
  let transitionProgress = 0;
  let transitionType = 'dissolve';

  const primaryIdx = allVideoClips.findIndex(
    (c) => currentTime >= c.start && currentTime <= c.start + c.duration
  );

  if (primaryIdx !== -1) {
    primaryClip = allVideoClips[primaryIdx];
    const candidateNext = allVideoClips[primaryIdx + 1];

    if (candidateNext) {
      const trans = primaryClip.transition;
      const hasTrans = trans && trans.type && trans.type !== 'none';
      const transDur = hasTrans ? Math.min(trans.duration || 0.6, primaryClip.duration * 0.45) : 0;

      if (candidateNext.start < primaryClip.start + primaryClip.duration) {
        const transStart = candidateNext.start;
        const transEnd = primaryClip.start + primaryClip.duration;
        const actualOverlap = Math.max(0.1, transEnd - transStart);

        if (currentTime >= transStart && currentTime <= transEnd) {
          inTransition = true;
          nextClip = candidateNext;
          transitionType = trans?.type || 'dissolve';
          transitionProgress = Math.max(0, Math.min(1, (currentTime - transStart) / actualOverlap));
        }
      } else if (hasTrans && transDur > 0) {
        const transEnd = primaryClip.start + primaryClip.duration;
        const transStart = transEnd - transDur;

        if (currentTime >= transStart && currentTime <= transEnd) {
          inTransition = true;
          nextClip = candidateNext;
          transitionType = trans.type;
          transitionProgress = Math.max(0, Math.min(1, (currentTime - transStart) / transDur));
        }
      }
    }
  }

  // Video Element Cache
  const getVideoElement = (url: string): HTMLVideoElement => {
    let video = videoElementsMap.current.get(url);
    if (!video) {
      video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      video.preload = 'auto';
      videoElementsMap.current.set(url, video);
    }
    return video;
  };

  // Draw Video Frame with full transforms, filters, and adjustments
  const drawVideoFrame = (
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    clip: any,
    width: number,
    height: number,
    xOffset = 0,
    yOffset = 0,
    scaleMod = 1,
    alpha = 1
  ) => {
    if (video.readyState < 2) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * (clip.opacity !== undefined ? clip.opacity : 1)));

    // Blend mode
    if (clip.blendMode && clip.blendMode !== 'normal') {
      ctx.globalCompositeOperation = clip.blendMode as GlobalCompositeOperation;
    }

    // Filter & Adjustments
    const filter = clip.filter;
    const adj = clip.adjustments || {};

    let filterString = '';
    // 28 Genuinely Distinct Filters
    if (filter === 'cinematic' || filter === 'cinema') filterString += 'contrast(1.25) saturate(1.15) hue-rotate(-5deg) ';
    else if (filter === 'film') filterString += 'contrast(1.1) sepia(0.2) hue-rotate(-10deg) ';
    else if (filter === 'moody') filterString += 'contrast(1.3) brightness(0.88) saturate(0.8) ';
    else if (filter === 'dramatic') filterString += 'contrast(1.45) brightness(0.85) saturate(0.9) ';
    else if (filter === 'teal_orange' || filter === 'teal') filterString += 'contrast(1.2) hue-rotate(15deg) saturate(1.2) ';
    else if (filter === 'warm_film') filterString += 'sepia(0.25) contrast(1.15) saturate(1.2) ';
    else if (filter === 'cold_film') filterString += 'hue-rotate(30deg) contrast(1.1) saturate(1.05) ';
    else if (filter === 'vintage') filterString += 'sepia(0.35) contrast(1.05) saturate(0.85) ';
    else if (filter === 'retro') filterString += 'sepia(0.3) saturate(1.3) contrast(1.2) ';
    else if (filter === 'vhs') filterString += 'sepia(0.2) contrast(1.1) brightness(1.05) ';
    else if (filter === 'faded') filterString += 'contrast(0.85) brightness(1.06) saturate(0.8) ';
    else if (filter === 'old_film') filterString += 'sepia(0.45) contrast(1.3) brightness(0.95) ';
    else if (filter === 'sepia') filterString += 'sepia(0.7) contrast(1.15) ';
    else if (['noir', 'blackwhite', 'bw', 'monochrome', 'b&w', 'mono', 'high_contrast_bw', 'soft_bw'].includes(filter)) {
      if (filter === 'high_contrast_bw') filterString += 'grayscale(1) contrast(1.65) brightness(0.94) ';
      else if (filter === 'soft_bw') filterString += 'grayscale(1) contrast(0.92) brightness(1.05) ';
      else filterString += 'grayscale(1) contrast(1.4) brightness(0.95) ';
    } else if (filter === 'travel' || filter === 'travel_warm') filterString += 'contrast(1.1) saturate(1.35) brightness(1.02) ';
    else if (filter === 'golden') filterString += 'sepia(0.25) saturate(1.4) contrast(1.15) ';
    else if (filter === 'tropical') filterString += 'saturate(1.5) contrast(1.2) ';
    else if (filter === 'sunset') filterString += 'sepia(0.3) saturate(1.4) contrast(1.18) ';
    else if (filter === 'cyberpunk') filterString += 'contrast(1.3) saturate(1.6) hue-rotate(200deg) ';
    else if (filter === 'neon') filterString += 'contrast(1.4) saturate(1.7) hue-rotate(280deg) ';
    else if (filter === 'tokyo_night') filterString += 'contrast(1.35) saturate(1.4) hue-rotate(220deg) brightness(0.9) ';
    else if (filter === 'matrix_green') filterString += 'contrast(1.3) hue-rotate(90deg) saturate(1.5) ';
    else if (filter === 'clean_pop') filterString += 'contrast(1.15) saturate(1.3) brightness(1.04) ';
    else if (filter === 'pastel') filterString += 'contrast(0.9) saturate(0.8) brightness(1.1) ';
    else if (filter === 'commercial') filterString += 'contrast(1.1) saturate(1.1) brightness(1.02) ';
    else if (filter === 'bright_airy') filterString += 'contrast(0.95) brightness(1.12) saturate(1.05) ';
    else if (filter === 'vibrant') filterString += 'contrast(1.1) saturate(1.4) brightness(1.05) ';
    else if (filter === 'warm') filterString += 'sepia(0.25) saturate(1.2) contrast(1.05) ';
    else if (filter === 'cool') filterString += 'hue-rotate(25deg) saturate(1.1) brightness(1.02) ';

    // Live pixel adjustments (Light, Color, Detail)
    if (adj.brightness) filterString += `brightness(${Math.max(0.2, 1 + adj.brightness / 100)}) `;
    if (adj.exposure) filterString += `brightness(${Math.max(0.2, 1 + adj.exposure / 100)}) `;
    if (adj.contrast) filterString += `contrast(${Math.max(0.2, 1 + adj.contrast / 100)}) `;
    if (adj.saturation) filterString += `saturate(${Math.max(0, 1 + adj.saturation / 100)}) `;
    if (adj.vibrance) filterString += `saturate(${Math.max(0, 1 + adj.vibrance / 120)}) `;
    if (adj.temperature) filterString += `sepia(${Math.max(0, adj.temperature / 200)}) `;
    if (adj.hue) filterString += `hue-rotate(${adj.hue}deg) `;
    if (adj.blur) filterString += `blur(${Math.max(1, Math.round(adj.blur * 0.15))}px) `;

    // Canvas filter effects: blur, bloom, vhs
    const effects = clip.effects || [];
    effects.forEach((eff: any) => {
      if (eff.enabled === false) return;
      const type = (eff.type || '').toLowerCase();
      if (type.includes('blur')) {
        const bRadius = Math.max(1, Math.round(((eff.intensity || 40) / 100) * 16));
        filterString += `blur(${bRadius}px) `;
      } else if (type.includes('bloom') || type.includes('glow')) {
        filterString += 'contrast(1.2) brightness(1.15) saturate(1.25) ';
      } else if (type.includes('vhs')) {
        filterString += 'sepia(0.25) contrast(1.1) brightness(1.05) ';
      }
    });

    if (filterString.trim()) {
      ctx.filter = filterString.trim();
    }

    // Aspect scaling
    const vRatio = video.videoWidth / video.videoHeight;
    const cRatio = width / height;
    let drawW = width;
    let drawH = height;
    let drawX = 0;
    let drawY = 0;

    if (vRatio > cRatio) {
      drawW = height * vRatio;
      drawX = (width - drawW) / 2;
    } else {
      drawH = width / vRatio;
      drawY = (height - drawH) / 2;
    }

    // Center origin transformations
    ctx.translate(width / 2, height / 2);

    // Flips
    const flipX = clip.flipH ? -1 : 1;
    const flipY = clip.flipV ? -1 : 1;
    ctx.scale(flipX, flipY);

    // Rotation
    if (clip.rotation) {
      ctx.rotate((clip.rotation * Math.PI) / 180);
    }

    // Scale
    const finalScale = (clip.scale || 1) * scaleMod;
    if (finalScale !== 1) {
      ctx.scale(finalScale, finalScale);
    }

    // Position offset
    const posX = (clip.positionX || 0) + xOffset;
    const posY = (clip.positionY || 0) + yOffset;

    ctx.drawImage(video, drawX - width / 2 + posX, drawY - height / 2 + posY, drawW, drawH);
    ctx.restore();

    // Render enabled visual effects (Film Grain, Letterbox, Vignette)
    effects.forEach((eff: any) => {
      if (!eff.enabled && eff.enabled !== undefined) return;
      if (eff.type === 'letterbox' || eff.type.includes('letterbox')) {
        const barH = height * 0.12;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, barH);
        ctx.fillRect(0, height - barH, width, barH);
      } else if (eff.type === 'vignette' || eff.type.includes('vignette')) {
        const rad = Math.max(width, height) * 0.7;
        const grad = ctx.createRadialGradient(width / 2, height / 2, rad * 0.3, width / 2, height / 2, rad);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${((eff.intensity || 50) / 100) * 0.75})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (eff.type === 'filmgrain' || eff.type.includes('grain') || eff.type.includes('film')) {
        // Procedural film grain dots
        ctx.fillStyle = `rgba(255, 255, 255, ${((eff.intensity || 35) / 100) * 0.12})`;
        for (let i = 0; i < 600; i++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      } else if (eff.type === 'vhs' || eff.type.includes('vhs')) {
        // Subtle VHS horizontal scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }
    });
  };

  // Audio Playback Synchronization (Multi-track with auto-ducking)
  useEffect(() => {
    // Check if primary video clip has audible dialogue
    const hasDialogue = primaryClip && !primaryClip.isMuted && (primaryClip.volume ?? 1) > 0.1;

    activeAudioClips.forEach((audioClip) => {
      if (!audioClip.url) return;
      let aEl = audioElementsMap.current.get(audioClip.url);
      if (!aEl) {
        aEl = new Audio(audioClip.url);
        audioElementsMap.current.set(audioClip.url, aEl);
      }

      // Volume with auto-ducking: if dialogue is present, duck BGM by 40%
      const duckFactor = hasDialogue ? 0.45 : 1.0;
      const targetVol = isMuted ? 0 : audioClip.effectiveVolume * volume * duckFactor;
      aEl.volume = Math.max(0, Math.min(1, targetVol));

      const offset = (currentTime - audioClip.start) * (audioClip.speed || 1) + (audioClip.trimStart || 0);
      if (Math.abs(aEl.currentTime - offset) > 0.3) {
        aEl.currentTime = Math.max(0, offset);
      }

      if (isPlaying && aEl.paused) {
        aEl.play().catch(() => {});
      } else if (!isPlaying && !aEl.paused) {
        aEl.pause();
      }
    });

    // Pause inactive audio elements
    audioElementsMap.current.forEach((aEl, url) => {
      if (!activeAudioClips.some((c) => c.url === url)) {
        if (!aEl.paused) aEl.pause();
      }
    });
  }, [activeAudioClips, primaryClip, currentTime, isPlaying, volume, isMuted]);

  // Video Audio & Playback Sync
  useEffect(() => {
    const activeUrls = new Set<string>();

    if (primaryClip?.url) {
      const v0 = getVideoElement(primaryClip.url);
      activeUrls.add(primaryClip.url);

      const clipOffset0 = (currentTime - primaryClip.start) * (primaryClip.speed || 1);
      const targetTime0 = (primaryClip.trimStart || 0) + clipOffset0;

      if (Math.abs(v0.currentTime - targetTime0) > 0.25) {
        v0.currentTime = Math.max(0, targetTime0);
      }

      v0.playbackRate = (primaryClip.speed || 1) * playbackRate;

      const baseVol0 = (primaryClip.volume !== undefined ? primaryClip.volume : 1) * volume;
      const targetVol0 = primaryClip.isMuted
        ? 0
        : inTransition
        ? baseVol0 * (1 - transitionProgress)
        : baseVol0;
      v0.muted = isMuted || !!primaryClip.isMuted;
      v0.volume = isMuted ? 0 : Math.min(1, Math.max(0, targetVol0));

      if (isPlaying && v0.paused) {
        v0.play().catch(() => {});
      } else if (!isPlaying && !v0.paused) {
        v0.pause();
      }
    }

    if (inTransition && nextClip?.url) {
      const v1 = getVideoElement(nextClip.url);
      activeUrls.add(nextClip.url);

      const clipOffset1 = (currentTime - nextClip.start) * (nextClip.speed || 1);
      const targetTime1 = (nextClip.trimStart || 0) + Math.max(0, clipOffset1);

      if (Math.abs(v1.currentTime - targetTime1) > 0.25) {
        v1.currentTime = Math.max(0, targetTime1);
      }

      v1.playbackRate = (nextClip.speed || 1) * playbackRate;

      const baseVol1 = (nextClip.volume !== undefined ? nextClip.volume : 1) * volume;
      const targetVol1 = nextClip.isMuted ? 0 : baseVol1 * transitionProgress;
      v1.muted = isMuted || !!nextClip.isMuted;
      v1.volume = isMuted ? 0 : Math.min(1, Math.max(0, targetVol1));

      if (isPlaying && v1.paused) {
        v1.play().catch(() => {});
      } else if (!isPlaying && !v1.paused) {
        v1.pause();
      }
    }

    videoElementsMap.current.forEach((v, url) => {
      if (!activeUrls.has(url)) {
        if (!v.paused) v.pause();
        v.muted = true;
      }
    });
  }, [primaryClip, nextClip, inTransition, transitionProgress, currentTime, isPlaying, volume, isMuted, playbackRate]);

  // Clean up
  useEffect(() => {
    return () => {
      videoElementsMap.current.forEach((v) => {
        v.pause();
        v.src = '';
      });
      videoElementsMap.current.clear();
      audioElementsMap.current.forEach((a) => {
        a.pause();
        a.src = '';
      });
      audioElementsMap.current.clear();
    };
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height =
      aspectRatio === '9:16'
        ? (1280 * 16) / 9
        : aspectRatio === '1:1'
        ? 1280
        : aspectRatio === '4:5'
        ? (1280 * 5) / 4
        : 720;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Pure black foundation
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, width, height);

    if (primaryClip?.url) {
      const v0 = getVideoElement(primaryClip.url);
      const v1 = inTransition && nextClip?.url ? getVideoElement(nextClip.url) : null;
      const hasReadyTransition = inTransition && v1 && v1.readyState >= 2;

      if (!hasReadyTransition) {
        if (v0.readyState >= 2) {
          drawVideoFrame(ctx, v0, primaryClip, width, height);
        } else {
          ctx.fillStyle = '#12121c';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#6366f1';
          ctx.font = '24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Loading: ${primaryClip.name}`, width / 2, height / 2);
        }
      } else if (v1) {
        // Render 30+ Transition Types
        const p = transitionProgress;
        const tr = transitionType.toLowerCase();

        if (tr === 'slideleft' || tr === 'pushleft' || tr === 'slide') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, -p * width, 0, 1, 1);
          drawVideoFrame(ctx, v1, nextClip, width, height, (1 - p) * width, 0, 1, 1);
        } else if (tr === 'slideright' || tr === 'pushright') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, p * width, 0, 1, 1);
          drawVideoFrame(ctx, v1, nextClip, width, height, -(1 - p) * width, 0, 1, 1);
        } else if (tr === 'slideup' || tr === 'pushup') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, 0, -p * height, 1, 1);
          drawVideoFrame(ctx, v1, nextClip, width, height, 0, (1 - p) * height, 1, 1);
        } else if (tr === 'slidedown' || tr === 'pushdown') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, 0, p * height, 1, 1);
          drawVideoFrame(ctx, v1, nextClip, width, height, 0, -(1 - p) * height, 1, 1);
        } else if (tr === 'zoomin' || tr === 'zoom' || tr === 'camerapush') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, 0, 0, 1 + p * 0.2, 1 - p);
          drawVideoFrame(ctx, v1, nextClip, width, height, 0, 0, 0.8 + p * 0.2, p);
        } else if (tr === 'zoomout' || tr === 'camerapull') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, 0, 0, 1 - p * 0.2, 1 - p);
          drawVideoFrame(ctx, v1, nextClip, width, height, 0, 0, 1.2 - p * 0.2, p);
        } else if (tr === 'wipeleft' || tr === 'wipe') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, 0, 0, 1, 1);
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, width * p, height);
          ctx.clip();
          drawVideoFrame(ctx, v1, nextClip, width, height, 0, 0, 1, 1);
          ctx.restore();
        } else if (tr === 'wiperight') {
          drawVideoFrame(ctx, v0, primaryClip, width, height, 0, 0, 1, 1);
          ctx.save();
          ctx.beginPath();
          ctx.rect(width * (1 - p), 0, width * p, height);
          ctx.clip();
          drawVideoFrame(ctx, v1, nextClip, width, height, 0, 0, 1, 1);
          ctx.restore();
        } else if (tr === 'cinematic' || tr === 'fade') {
          if (p < 0.5) {
            drawVideoFrame(ctx, v0, primaryClip, width, height, 0, 0, 1, 1 - p * 2);
          } else {
            drawVideoFrame(ctx, v1, nextClip, width, height, 0, 0, 1, (p - 0.5) * 2);
          }
        } else if (tr === 'light' || tr === 'flash' || tr === 'filmburn') {
          drawVideoFrame(ctx, p < 0.5 ? v0 : v1, p < 0.5 ? primaryClip : nextClip, width, height, 0, 0, 1, 1);
          const flashAlpha = p < 0.5 ? p * 2 : (1 - p) * 2;
          ctx.fillStyle = `rgba(255, 245, 230, ${Math.min(1, flashAlpha)})`;
          ctx.fillRect(0, 0, width, height);
        } else if (tr === 'glitch') {
          const activeV = p < 0.5 ? v0 : v1;
          const activeC = p < 0.5 ? primaryClip : nextClip;
          const jitterX = (Math.random() - 0.5) * 30;
          drawVideoFrame(ctx, activeV, activeC, width, height, jitterX, 0, 1, 1);
        } else {
          // Dissolve / Crossfade
          drawVideoFrame(ctx, v0, primaryClip, width, height, 0, 0, 1, 1 - p);
          drawVideoFrame(ctx, v1, nextClip, width, height, 0, 0, 1, p);
        }
      }
    } else {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '26px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Drop clips on the timeline to preview', width / 2, height / 2);
    }

    // Draw active stickers / elements
    activeStickers.forEach((st) => {
      ctx.save();
      const content = st.sticker?.content || '✨';
      const scale = st.scale || 1;
      const rot = st.rotation || 0;
      const opacity = st.opacity !== undefined ? st.opacity : 1;
      const px = (st.positionX || 0) + width / 2;
      const py = (st.positionY || 0) + height / 2;

      ctx.globalAlpha = opacity;
      ctx.translate(px, py);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(scale, scale);

      if (st.sticker?.type === 'badge') {
        // Draw liquid-glass badge
        ctx.fillStyle = 'rgba(238, 43, 105, 0.9)';
        ctx.shadowColor = 'rgba(238, 43, 105, 0.5)';
        ctx.shadowBlur = 15;
        const bWidth = 180;
        const bHeight = 44;
        ctx.beginPath();
        ctx.roundRect(-bWidth / 2, -bHeight / 2, bWidth, bHeight, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(content, 0, 0);
      } else {
        // Emoji / Reaction
        ctx.font = '64px "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(content, 0, 0);
      }
      ctx.restore();
    });

    // Draw active text overlays & captions
    activeTextClips.forEach((textClip) => {
      if (!textClip.text) return;
      ctx.save();
      const style = textClip.style || {
        fontSize: 42,
        fontFamily: 'Plus Jakarta Sans',
        color: '#ffffff',
        position: 'center',
        fontWeight: 'bold',
      };

      ctx.fillStyle = style.color || '#ffffff';
      ctx.font = `${style.fontWeight === 'bold' || style.fontWeight === 'black' ? 'bold ' : ''}${
        (style.fontSize || 36) * 1.5
      }px "${style.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      let yPos = height / 2;
      if (style.position === 'top') yPos = height * 0.18;
      if (style.position === 'bottom') yPos = height * 0.82;

      ctx.fillText(textClip.text, width / 2, yPos);
      ctx.restore();
    });
  }, [
    primaryClip,
    nextClip,
    inTransition,
    transitionProgress,
    transitionType,
    activeTextClips,
    activeStickers,
    currentTime,
    aspectRatio,
  ]);

  // Playback timer tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(
        currentTime + 0.05 * playbackRate >= totalDuration ? 0 : currentTime + 0.05 * playbackRate
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, totalDuration, playbackRate, setCurrentTime]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center p-4 bg-[#09090b] select-none min-h-0"
    >
      {/* Viewport Frame with Left-Side Vertical Audio VU Meter */}
      <div className="relative flex items-center justify-center w-full flex-1 max-h-[64vh] gap-3">
        {/* Left Vertical Audio VU Meter & Controls Column */}
        <div className="flex flex-col items-center justify-between h-full max-h-[58vh] py-2 z-10">
          {/* Top-left Option dots */}
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
            title="Player options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Options Dropdown Menu */}
          {showOptionsMenu && (
            <div className="absolute top-4 left-14 z-50 w-44 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 text-xs text-zinc-300">
              <button
                onClick={() => { setPreviewZoom('fit'); setShowOptionsMenu(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white"
              >
                Fit to Screen
              </button>
              <button
                onClick={() => { setPreviewZoom('100%'); setShowOptionsMenu(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white"
              >
                100% Original Size
              </button>
              <button
                onClick={() => { setShowFramesMode(!showFramesMode); setShowOptionsMenu(false); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-white"
              >
                {showFramesMode ? 'Show Timecode' : 'Show Frame Count'}
              </button>
            </div>
          )}

          {/* Vertical Audio VU Meter Bar */}
          <div
            className="flex-1 my-3 w-2.5 sm:w-3 rounded-full bg-zinc-900 border border-zinc-800 p-0.5 flex flex-col justify-end overflow-hidden shadow-inner"
            title={`Audio Level: ${vuLevel}%`}
          >
            <div
              className="w-full rounded-full transition-all duration-75 bg-gradient-to-t from-emerald-500 via-lime-400 to-amber-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              style={{ height: `${isMuted ? 0 : vuLevel}%` }}
            />
          </div>

          {/* Bottom Audio Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1 rounded-lg transition-colors ${
              isMuted ? 'text-rose-400 hover:bg-rose-950/40' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center Canvas Viewport */}
        <div
          style={previewZoom !== 'fit' ? { transform: `scale(${parseFloat(previewZoom) / 100})`, transformOrigin: 'center center' } : undefined}
          className={`relative ${getAspectClass()} rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex items-center justify-center transition-transform duration-150`}
        >
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {/* Overlay Aspect badge */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-zinc-700 text-[10px] font-medium text-zinc-300 pointer-events-none">
            {aspectRatio}
          </div>
        </div>
      </div>

      {/* CapCut-Style Precision Player Transport Bar */}
      <div className="w-full max-w-2xl mt-1.5 sm:mt-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[#111116] border border-zinc-800/90 shadow-xl flex flex-col gap-1">
        {/* Scrubber Range Slider */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={Math.max(1, totalDuration)}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Frame Count / Timecode indicator */}
          <button
            onClick={() => setShowFramesMode(!showFramesMode)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] sm:text-[11px] border border-zinc-800 transition-colors"
            title="Click to toggle frames / timecode"
          >
            {showFramesMode ? (
              <>
                <span className="font-bold text-cyan-300">{Math.round(currentTime * (currentProject?.fps || 30))}</span>
                <span className="text-zinc-500">/{Math.round(totalDuration * (currentProject?.fps || 30))}</span>
              </>
            ) : (
              <>
                <span className="font-bold text-cyan-300">{formatTimecode(currentTime).slice(3, 8)}</span>
                <span className="text-zinc-500">/{formatTimecode(totalDuration).slice(3, 8)}</span>
              </>
            )}
            <span className="text-[9px] text-zinc-500 ml-0.5">▾</span>
          </button>

          {/* Center: Transport Button Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Loop Toggle Button */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={isLooping ? 'Looping Enabled (∞)' : 'Enable Loop (∞)'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Step -1 Frame */}
            <button
              onClick={() => stepFrame(-1)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Step -1 Frame (|<)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause Button — Vibrant Cyan Glowing Accent */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:brightness-110 flex items-center justify-center active:scale-95 transition-all shadow-[0_0_14px_rgba(34,211,238,0.45)]"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-zinc-950 fill-zinc-950" /> : <Play className="w-4 h-4 ml-0.5 text-zinc-950 fill-zinc-950" />}
            </button>

            {/* Step +1 Frame */}
            <button
              onClick={() => stepFrame(1)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Step +1 Frame (>|)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Quick Tools & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Playback Rate Speed Toggle */}
            <button
              onClick={cycleSpeed}
              className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-zinc-300 border border-zinc-800 transition-colors"
              title="Playback speed"
            >
              <span>{playbackRate}x</span>
            </button>

            {/* Canvas Zoom */}
            <select
              value={previewZoom}
              onChange={(e) => setPreviewZoom(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
              title="Canvas view zoom"
            >
              <option value="fit">Fit</option>
              <option value="50%">50%</option>
              <option value="75%">75%</option>
              <option value="100%">100%</option>
            </select>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Fullscreen (⤢)"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
