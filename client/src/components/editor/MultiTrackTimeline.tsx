import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Magnet,
  Plus,
  Volume2,
  VolumeX,
  Type,
  Video,
  VideoOff,
  Music,
  Smile,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Radio,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Sun,
  Maximize2,
  RotateCcw,
  Film,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { TimelineClip, TimelineTrack } from '../../types/index.js';
import { formatTimecode, formatDuration } from '../../utils/time.js';

export const MultiTrackTimeline: React.FC = () => {
  const {
    currentProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    zoomLevel,
    setZoomLevel,
    snappingEnabled,
    setSnappingEnabled,
    activeClipId,
    activeTrackId,
    selectClip,
    splitClipAtPlayhead,
    deleteSelectedClip,
    duplicateSelectedClip,
    updateClip,
    moveClip,
    canUndo,
    canRedo,
    undo,
    redo,
    copySelectedClip,
    pasteClip,
    addTrack,
    deleteTrack,
    toggleTrackMute,
    toggleTrackLock,
    toggleTrackVisibility,
    toggleTrackSolo,
    beatMarkers,
    snapToBeats,
    setSnapToBeats,
    detachAudio,
    addToast,
  } = useAppStore();

  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [trimmingState, setTrimmingState] = useState<{
    trackId: string;
    clipId: string;
    handle: 'left' | 'right';
    startX: number;
    initialStart: number;
    initialDuration: number;
  } | null>(null);

  const [draggingClipState, setDraggingClipState] = useState<{
    trackId: string;
    clipId: string;
    startX: number;
    initialStart: number;
    duration: number;
  } | null>(null);

  const [isLayersExpanded, setIsLayersExpanded] = useState(true);

  const handleResetAll = () => {
    setCurrentTime(0);
    setZoomLevel(45);
    addToast({ type: 'info', title: 'Timeline Reset', description: 'Playhead moved to 00:00, zoom calibrated.' });
  };

  const handleDetachAudio = () => {
    if (!activeClipId || !activeTrackId) {
      addToast({ type: 'warning', title: 'Notice', description: 'Select a video clip to detach audio.' });
      return;
    }
    detachAudio(activeTrackId, activeClipId);
    addToast({ type: 'success', title: 'Audio Detached', description: 'Sound extracted to independent audio track.' });
  };

  const duration = Math.max(20, currentProject?.duration || 20);
  const tracks = currentProject?.tracks || [];

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        splitClipAtPlayhead();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedClip();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        if (canRedo) redo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        copySelectedClip();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        pasteClip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    setIsPlaying,
    splitClipAtPlayhead,
    deleteSelectedClip,
    canUndo,
    canRedo,
    undo,
    redo,
    copySelectedClip,
    pasteClip,
  ]);

  // Compute ruler markings
  const rulerStepSec = zoomLevel < 30 ? 5 : zoomLevel < 60 ? 2 : 1;
  const rulerTicks = [];
  for (let t = 0; t <= duration + 10; t += rulerStepSec) {
    rulerTicks.push(t);
  }

  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingPlayhead(true);
    updatePlayheadFromMouse(e);
  };

  const updatePlayheadFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (!tracksContainerRef.current) return;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const scrollLeft = tracksContainerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    let newTime = Math.max(0, clickX / zoomLevel);

    // Snap to nearest beat if snapping enabled
    if (snappingEnabled && snapToBeats && beatMarkers.length > 0) {
      const nearestBeat = beatMarkers.reduce((prev, curr) =>
        Math.abs(curr - newTime) < Math.abs(prev - newTime) ? curr : prev
      );
      if (Math.abs(nearestBeat - newTime) < 0.15) {
        newTime = nearestBeat;
      }
    }

    setCurrentTime(newTime);
  };

  // Touch Scrubber & Clip Handlers for Mobile Devices
  const handleRulerTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    setIsDraggingPlayhead(true);
    updatePlayheadFromTouch(e.touches[0]);
  };

  const updatePlayheadFromTouch = (touch: React.Touch | Touch) => {
    if (!tracksContainerRef.current) return;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const scrollLeft = tracksContainerRef.current.scrollLeft;
    const clickX = touch.clientX - rect.left + scrollLeft;
    let newTime = Math.max(0, clickX / zoomLevel);

    if (snappingEnabled && snapToBeats && beatMarkers.length > 0) {
      const nearestBeat = beatMarkers.reduce((prev, curr) =>
        Math.abs(curr - newTime) < Math.abs(prev - newTime) ? curr : prev
      );
      if (Math.abs(nearestBeat - newTime) < 0.15) {
        newTime = nearestBeat;
      }
    }

    setCurrentTime(newTime);
  };

  const handleClipTouchStart = (
    e: React.TouchEvent,
    trackId: string,
    clip: TimelineClip
  ) => {
    e.stopPropagation();
    selectClip(clip.id, trackId);
    if (e.touches.length > 0) {
      setDraggingClipState({
        trackId,
        clipId: clip.id,
        startX: e.touches[0].clientX,
        initialStart: clip.start,
        duration: clip.duration,
      });
    }
  };

  const handleTrimTouchStart = (
    e: React.TouchEvent,
    trackId: string,
    clip: TimelineClip,
    handle: 'left' | 'right'
  ) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      setTrimmingState({
        trackId,
        clipId: clip.id,
        handle,
        startX: e.touches[0].clientX,
        initialStart: clip.start,
        initialDuration: clip.duration,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    if (isDraggingPlayhead) {
      updatePlayheadFromTouch(touch);
    } else if (trimmingState) {
      const deltaPx = touch.clientX - trimmingState.startX;
      const deltaSec = deltaPx / zoomLevel;
      if (trimmingState.handle === 'right') {
        let newDur = Math.max(0.5, trimmingState.initialDuration + deltaSec);
        updateClip(trimmingState.trackId, trimmingState.clipId, {
          duration: parseFloat(newDur.toFixed(2)),
          trimEnd: parseFloat((trimmingState.initialStart + newDur).toFixed(2)),
        });
      } else if (trimmingState.handle === 'left') {
        let newStart = Math.max(0, trimmingState.initialStart + deltaSec);
        let newDur = Math.max(0.5, trimmingState.initialDuration - deltaSec);
        updateClip(trimmingState.trackId, trimmingState.clipId, {
          start: parseFloat(newStart.toFixed(2)),
          duration: parseFloat(newDur.toFixed(2)),
        });
      }
    } else if (draggingClipState) {
      const deltaPx = touch.clientX - draggingClipState.startX;
      let newStart = Math.max(0, draggingClipState.initialStart + deltaPx / zoomLevel);
      updateClip(draggingClipState.trackId, draggingClipState.clipId, {
        start: parseFloat(newStart.toFixed(2)),
      });
    }
  };

  // Trimming handlers
  const handleTrimMouseDown = (
    e: React.MouseEvent,
    trackId: string,
    clip: TimelineClip,
    handle: 'left' | 'right'
  ) => {
    e.stopPropagation();
    setTrimmingState({
      trackId,
      clipId: clip.id,
      handle,
      startX: e.clientX,
      initialStart: clip.start,
      initialDuration: clip.duration,
    });
  };

  // Clip Drag Reposition Handler
  const handleClipMouseDown = (
    e: React.MouseEvent,
    trackId: string,
    clip: TimelineClip
  ) => {
    e.stopPropagation();
    selectClip(clip.id, trackId);
    setDraggingClipState({
      trackId,
      clipId: clip.id,
      startX: e.clientX,
      initialStart: clip.start,
      duration: clip.duration,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingPlayhead) {
      updatePlayheadFromMouse(e);
    } else if (trimmingState) {
      const deltaPx = e.clientX - trimmingState.startX;
      const deltaSec = deltaPx / zoomLevel;

      if (trimmingState.handle === 'right') {
        let newDur = Math.max(0.5, trimmingState.initialDuration + deltaSec);
        if (snappingEnabled && snapToBeats && beatMarkers.length > 0) {
          const targetEnd = trimmingState.initialStart + newDur;
          const nearestBeat = beatMarkers.reduce((prev, curr) =>
            Math.abs(curr - targetEnd) < Math.abs(prev - targetEnd) ? curr : prev
          );
          if (Math.abs(nearestBeat - targetEnd) < 0.2) {
            newDur = Math.max(0.5, nearestBeat - trimmingState.initialStart);
          }
        }
        updateClip(trimmingState.trackId, trimmingState.clipId, {
          duration: parseFloat(newDur.toFixed(2)),
          trimEnd: parseFloat((trimmingState.initialStart + newDur).toFixed(2)),
        });
      } else if (trimmingState.handle === 'left') {
        let newStart = Math.max(0, trimmingState.initialStart + deltaSec);
        let newDur = Math.max(0.5, trimmingState.initialDuration - deltaSec);
        if (snappingEnabled && snapToBeats && beatMarkers.length > 0) {
          const nearestBeat = beatMarkers.reduce((prev, curr) =>
            Math.abs(curr - newStart) < Math.abs(prev - newStart) ? curr : prev
          );
          if (Math.abs(nearestBeat - newStart) < 0.2) {
            const shift = nearestBeat - trimmingState.initialStart;
            newStart = Math.max(0, nearestBeat);
            newDur = Math.max(0.5, trimmingState.initialDuration - shift);
          }
        }
        updateClip(trimmingState.trackId, trimmingState.clipId, {
          start: parseFloat(newStart.toFixed(2)),
          duration: parseFloat(newDur.toFixed(2)),
        });
      }
    } else if (draggingClipState) {
      const deltaPx = e.clientX - draggingClipState.startX;
      let newStart = Math.max(0, draggingClipState.initialStart + deltaPx / zoomLevel);

      // Snap to nearest beat
      if (snappingEnabled && snapToBeats && beatMarkers.length > 0) {
        const nearestBeat = beatMarkers.reduce((prev, curr) =>
          Math.abs(curr - newStart) < Math.abs(prev - newStart) ? curr : prev
        );
        if (Math.abs(nearestBeat - newStart) < 0.25) {
          newStart = nearestBeat;
        }
      }

      moveClip(draggingClipState.trackId, draggingClipState.clipId, newStart);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingPlayhead(false);
    setTrimmingState(null);
    setDraggingClipState(null);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="flex-1 bg-[#0a0a0e] border-t border-zinc-800/80 flex flex-col select-none relative overflow-hidden"
    >
      {/* Timeline Action Bar */}
      <div className="h-9 sm:h-10 px-2 sm:px-4 bg-[#131317] border-b border-zinc-800 flex items-center justify-between z-10 overflow-x-auto no-scrollbar">
        {/* Editing Tools */}
        <div className="flex items-center gap-1">
          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

          {/* Cut Clip */}
          <button
            onClick={splitClipAtPlayhead}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            title="Split clip at playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-zinc-300" />
            <span>Cut (S)</span>
          </button>

          {/* Copy / Paste */}
          <button
            onClick={copySelectedClip}
            disabled={!activeClipId}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Copy Clip (Ctrl+C)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={pasteClip}
            disabled={!activeClipId}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Paste Clip (Ctrl+V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
          </button>

          {/* Delete Clip */}
          <button
            onClick={deleteSelectedClip}
            disabled={!activeClipId}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 transition-colors ml-0.5"
            title="Delete selected clip (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Snapping & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Beat Markers Snapping Toggle */}
          <button
            onClick={() => setSnapToBeats(!snapToBeats)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              snapToBeats
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Snap to music beats"
          >
            <Radio className="w-3 h-3" />
            <span>Beats</span>
          </button>

          {/* Magnet Snapping Toggle */}
          <button
            onClick={() => setSnappingEnabled(!snappingEnabled)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              snappingEnabled
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Magnet Snapping"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Slider */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoomLevel(zoomLevel - 10)}
              className="p-1 rounded-md text-zinc-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={20}
              max={100}
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
              className="w-20 h-1 bg-zinc-800 rounded appearance-none accent-zinc-300 cursor-pointer"
            />
            <button
              onClick={() => setZoomLevel(zoomLevel + 10)}
              className="p-1 rounded-md text-zinc-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracks and Time Ruler Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Compact w-12 on mobile, w-44 on desktop) */}
        <div className="w-12 sm:w-44 bg-[#111116] border-r border-zinc-800 shrink-0 flex flex-col pt-7 z-10 overflow-y-auto no-scrollbar">
          {tracks.map((track) => {
            const getBadge = () => {
              const name = (track.name || '').toLowerCase();
              if (name.includes('bgm') || name.includes('music')) {
                return { code: 'BGM', style: 'bg-rose-950/70 text-rose-300 border-rose-800/60' };
              }
              if (name.includes('vox') || name.includes('voice') || name.includes('dialogue')) {
                return { code: 'VOX', style: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60' };
              }
              if (name.includes('caption') || name.includes('subtitle')) {
                return { code: 'CAP', style: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60' };
              }
              if (name.includes('overlay') || name.includes('pip') || track.type === 'sticker') {
                return { code: 'OV1', style: 'bg-purple-950/70 text-purple-300 border-purple-800/60' };
              }
              if (name.includes('fx') || name.includes('effect') || track.type === 'effects') {
                return { code: 'FX1', style: 'bg-amber-950/70 text-amber-300 border-amber-800/60' };
              }
              if (track.type === 'text') {
                const tIdx = tracks.filter((t) => t.type === 'text').findIndex((t) => t.id === track.id) + 1;
                return { code: `T${tIdx}`, style: 'bg-blue-950/70 text-blue-300 border-blue-800/60' };
              }
              if (track.type === 'audio') {
                const aIdx = tracks.filter((t) => t.type === 'audio').findIndex((t) => t.id === track.id) + 1;
                return { code: `A${aIdx}`, style: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60' };
              }
              const vIdx = tracks.filter((t) => t.type === 'video').findIndex((t) => t.id === track.id) + 1;
              return { code: `V${vIdx}`, style: 'bg-zinc-800 text-zinc-100 border-zinc-700' };
            };
            const badge = getBadge();

            return (
              <div
                key={track.id}
                className="h-14 px-1.5 sm:px-2.5 flex items-center justify-between border-b border-zinc-800/70 text-xs text-zinc-400"
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1 mx-auto sm:mx-0">
                  {/* Track Code Badge (V1, OV1, FX1, T1, CAP, A1, BGM, VOX) */}
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${badge.style}`}>
                    {badge.code}
                  </span>
                  <span className="truncate font-medium text-[11px] text-zinc-300 hidden sm:inline">{track.name}</span>
                </div>

                {/* Track Quick Actions (Desktop only to conserve mobile width) */}
                <div className="hidden sm:flex items-center gap-1 shrink-0 text-zinc-500">
                  {/* Lock */}
                  <button
                    onClick={() => toggleTrackLock(track.id)}
                    className={`p-0.5 rounded transition-colors ${track.isLocked ? 'text-amber-400' : 'hover:text-zinc-300'}`}
                    title={track.isLocked ? 'Unlock Track' : 'Lock Track'}
                  >
                    {track.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>

                  {/* Audio Mute */}
                  <button
                    onClick={() => toggleTrackMute(track.id)}
                    className={`p-0.5 rounded transition-colors ${track.isMuted ? 'text-rose-400' : 'hover:text-zinc-300'}`}
                    title={track.isMuted ? 'Unmute Track Audio' : 'Mute Track Audio'}
                  >
                    {track.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>

                  {/* Video Mute / Disable */}
                  {track.type === 'video' && (
                    <button
                      onClick={() => toggleTrackVisibility(track.id)}
                      className={`p-0.5 rounded transition-colors ${track.isHidden ? 'text-rose-400' : 'hover:text-zinc-300'}`}
                      title={track.isHidden ? 'Enable Track Video' : 'Disable Track Video'}
                    >
                      {track.isHidden ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    </button>
                  )}

                  {/* Visibility Eye */}
                  <button
                    onClick={() => toggleTrackVisibility(track.id)}
                    className={`p-0.5 rounded transition-colors ${track.isHidden ? 'text-zinc-600' : 'hover:text-zinc-300'}`}
                    title={track.isHidden ? 'Show Track' : 'Hide Track'}
                  >
                    {track.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Track Button (Desktop) */}
          <div className="hidden sm:block p-2 border-b border-zinc-800/60">
            <button
              onClick={() => addTrack('video')}
              className="w-full py-1 px-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-semibold flex items-center justify-center gap-1 border border-zinc-800 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Add Track</span>
            </button>
          </div>

          {/* Collapsible Layers Tree Hierarchy (Desktop) */}
          <div className="hidden sm:block p-2 text-[10px] font-mono text-zinc-400 select-none">
            <div
              onClick={() => setIsLayersExpanded(!isLayersExpanded)}
              className="flex items-center justify-between text-zinc-400 hover:text-white cursor-pointer py-1 font-semibold"
            >
              <span>Layers</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLayersExpanded ? '' : '-rotate-90'}`} />
            </div>

            {isLayersExpanded && (
              <div className="space-y-1 pl-1 pt-1 text-[9px] text-zinc-500">
                <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                  <span>▸</span>
                  <span>Assets</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-zinc-400">
                    <span>▾</span>
                    <span>Archive</span>
                  </div>
                  <div className="pl-3 space-y-0.5 text-zinc-500">
                    <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                      <span>📄</span>
                      <span>Image</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer">
                  <span>▸</span>
                  <span>Common</span>
                </div>
                <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer text-cyan-400">
                  <span>♫</span>
                  <span>Audio Track</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Tracks Area */}
        <div
          ref={tracksContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-crosshair bg-[#09090b] touch-pan-x"
        >
          {/* Time Ruler */}
          <div
            onMouseDown={handleRulerMouseDown}
            onTouchStart={handleRulerTouchStart}
            className="h-7 bg-[#141417] border-b border-zinc-800 relative select-none"
            style={{ width: `${(duration + 10) * zoomLevel}px` }}
          >
            {rulerTicks.map((sec) => (
              <div
                key={sec}
                className="absolute top-0 bottom-0 border-l border-zinc-800 pl-1 text-[9px] font-mono text-zinc-500 pointer-events-none"
                style={{ left: `${sec * zoomLevel}px` }}
              >
                {sec % (rulerStepSec * 2) === 0 ? formatTimecode(sec).slice(3, 8) : ''}
              </div>
            ))}

            {/* Vertical Beat Markers on ruler */}
            {snapToBeats &&
              beatMarkers.map((beatTime, idx) => (
                <div
                  key={`beat-${idx}`}
                  className="absolute top-0 bottom-0 w-[1px] bg-zinc-500/40 pointer-events-none"
                  style={{ left: `${beatTime * zoomLevel}px` }}
                />
              ))}
          </div>

          {/* Draggable Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-300 via-cyan-400 to-cyan-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.7)]"
            style={{ left: `${currentTime * zoomLevel}px` }}
          >
            <div className="w-3 h-3 bg-cyan-400 rounded-b-md -translate-x-[5px] shadow-[0_0_10px_rgba(34,211,238,0.8)] border border-cyan-200" />
          </div>

          {/* Tracks Content Area */}
          <div style={{ width: `${(duration + 10) * zoomLevel}px` }}>
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`h-14 relative border-b border-zinc-800/40 bg-black/20 ${
                  track.isLocked ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {/* Beat marker vertical guides across tracks */}
                {snapToBeats &&
                  beatMarkers.map((beatTime, idx) => (
                    <div
                      key={`track-beat-${idx}`}
                      className="absolute top-0 bottom-0 w-[1px] bg-zinc-600/20 pointer-events-none"
                      style={{ left: `${beatTime * zoomLevel}px` }}
                    />
                  ))}

                {track.clips.map((clip) => {
                  const isSelected = activeClipId === clip.id;
                  const clipLeft = clip.start * zoomLevel;
                  const clipWidth = clip.duration * zoomLevel;
                  const isAudio = track.type === 'audio';
                  const isBgm = isAudio && (track.name.toLowerCase().includes('bgm') || track.name.toLowerCase().includes('music') || track.name.toLowerCase().includes('sound'));
                  const isText = track.type === 'text';
                  const isSticker = track.type === 'sticker';
                  const isEffects = track.type === 'effects';
                  const isVideo = track.type === 'video';
                  const frameCount = Math.max(1, Math.min(24, Math.floor(clipWidth / 48)));

                  return (
                    <div
                      key={clip.id}
                      onMouseDown={(e) => handleClipMouseDown(e, track.id, clip)}
                      onTouchStart={(e) => handleClipTouchStart(e, track.id, clip)}
                      className={`absolute top-1.5 bottom-1.5 rounded-xl flex items-center px-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                        isSelected
                          ? 'border-2 border-yellow-400 bg-zinc-850/95 shadow-[0_0_14px_rgba(250,204,21,0.45)] ring-1 ring-yellow-400/30 z-20'
                          : isVideo
                          ? 'border border-zinc-700/70 bg-zinc-900/90 hover:border-zinc-500'
                          : isBgm
                          ? 'border border-purple-500/50 bg-purple-950/40 text-purple-200 hover:border-purple-400'
                          : isAudio
                          ? 'border border-cyan-500/50 bg-cyan-950/40 text-cyan-200 hover:border-cyan-400'
                          : isText
                          ? 'border border-amber-500/50 bg-amber-950/40 text-amber-200 hover:border-amber-400'
                          : isSticker || isEffects
                          ? 'border border-emerald-500/50 bg-emerald-950/40 text-emerald-200 hover:border-emerald-400'
                          : 'border border-zinc-700/70 bg-zinc-900/90 hover:border-zinc-500'
                      }`}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${Math.max(20, clipWidth)}px`,
                      }}
                    >
                      {/* Filmstrip Frame Sequence for Video Track */}
                      {isVideo && (
                        <div className="absolute inset-0 flex overflow-hidden opacity-30 pointer-events-none">
                          {Array.from({ length: frameCount }).map((_, i) => (
                            <div
                              key={i}
                              className="h-full border-r border-black/40 flex-shrink-0 flex items-center justify-center bg-zinc-900/40 relative overflow-hidden"
                              style={{ width: `${Math.max(36, clipWidth / frameCount)}px` }}
                            >
                              {clip.thumbnailUrl ? (
                                <img src={clip.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-85" />
                              ) : clip.url ? (
                                <video src={clip.url} className="w-full h-full object-cover opacity-85" />
                              ) : (
                                <Film className="w-3 h-3 text-zinc-600 opacity-40" />
                              )}
                              <div className="absolute inset-x-0 top-0 h-[2px] bg-black/50" />
                              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-black/50" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Left Trim Handle with CapCut / Reference '<' Handle Pill */}
                      <div
                        onMouseDown={(e) => handleTrimMouseDown(e, track.id, clip, 'left')}
                        onTouchStart={(e) => handleTrimTouchStart(e, track.id, clip, 'left')}
                        className={`absolute left-0 top-0 bottom-0 flex items-center justify-center cursor-ew-resize select-none transition-all z-20 ${
                          isSelected
                            ? 'w-3.5 -ml-0.5 bg-yellow-400 text-zinc-950 font-black text-[10px] rounded-l-lg shadow-md hover:bg-yellow-300'
                            : 'w-2 bg-white/10 hover:bg-zinc-200 rounded-l-lg'
                        }`}
                        title="Drag to trim start"
                      >
                        {isSelected && <span>‹</span>}
                      </div>

                      {/* Waveform Visualization for Audio Track */}
                      {isAudio && (
                        <div className="absolute inset-0 flex items-center justify-around opacity-35 pointer-events-none px-1">
                          {(clip.peaks || [30, 60, 45, 80, 50, 70, 40, 90, 65, 85, 40, 75, 55, 90]).map((p, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${isBgm ? 'bg-purple-400' : 'bg-cyan-400'}`}
                              style={{ height: `${p}%` }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Thumbnail for Video Clips */}
                      {isVideo && clip.url && (
                        <div className="w-6 h-6 rounded bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0 mr-1.5 z-10">
                          <video src={clip.url} className="w-full h-full object-cover pointer-events-none" />
                        </div>
                      )}

                      {/* Clip label */}
                      <span className="text-[11px] font-semibold text-zinc-200 truncate select-none z-10 drop-shadow-sm">
                        {clip.text || clip.name}
                      </span>

                      {/* Duration Badge */}
                      <span className="text-[9px] font-mono text-zinc-400 bg-black/70 px-1 py-0.5 rounded ml-1.5 z-10 shrink-0 border border-white/5">
                        {formatDuration(clip.duration)}
                      </span>

                      {/* Badges: Filter / Speed / Transition */}
                      <div className="flex items-center gap-1 ml-1.5 z-10">
                        {clip.speed && clip.speed !== 1 && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700 font-mono">
                            {clip.speed}x
                          </span>
                        )}
                        {clip.transition && clip.transition.type !== 'none' && (
                          <span className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700 font-mono flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{clip.transition.type}</span>
                          </span>
                        )}
                        {clip.effects && clip.effects.filter((e: any) => e.enabled !== false).length > 0 && (
                          <span className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700 font-mono flex items-center gap-0.5">
                            <Layers className="w-2.5 h-2.5" />
                            <span>{clip.effects.filter((e: any) => e.enabled !== false).length} fx</span>
                          </span>
                        )}
                        {clip.filter && clip.filter !== 'none' && (
                          <span className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700 font-mono">
                            {clip.filter}
                          </span>
                        )}
                      </div>

                      {/* Right Trim Handle with CapCut / Reference '>' Handle Pill */}
                      <div
                        onMouseDown={(e) => handleTrimMouseDown(e, track.id, clip, 'right')}
                        onTouchStart={(e) => handleTrimTouchStart(e, track.id, clip, 'right')}
                        className={`absolute right-0 top-0 bottom-0 flex items-center justify-center cursor-ew-resize select-none transition-all z-20 ${
                          isSelected
                            ? 'w-3.5 -mr-0.5 bg-yellow-400 text-zinc-950 font-black text-[10px] rounded-r-lg shadow-md hover:bg-yellow-300'
                            : 'w-2 bg-white/10 hover:bg-zinc-200 rounded-r-lg'
                        }`}
                        title="Drag to trim end"
                      >
                        {isSelected && <span>›</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CapCut-Inspired Bottom Action Toolbar matching reference image */}
      <div className="h-10 bg-[#121215] border-t border-zinc-800/80 px-3 flex items-center justify-between z-10 shrink-0">
        {/* Left / Center Tools: Reset All, Volume, Music, Text, Split, Canvas, Adjust */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
            title="Reset All Playhead & View"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" />
            <span>Reset All</span>
          </button>

          <div className="w-[1px] h-3.5 bg-zinc-800 mx-0.5 hidden sm:block" />

          <button
            onClick={() => addToast({ type: 'info', title: 'Volume', description: 'Adjust track and clip audio levels.' })}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            <span className="hidden sm:inline">Volume</span>
          </button>

          <button
            onClick={() => addTrack('audio')}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
          >
            <Music className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Music</span>
          </button>

          <button
            onClick={() => addTrack('text')}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
          >
            <Type className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Text</span>
          </button>

          <button
            onClick={splitClipAtPlayhead}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
          >
            <Scissors className="w-3 h-3" />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            onClick={() => addToast({ type: 'info', title: 'Canvas Aspect', description: 'Use top aspect ratio selector to switch 16:9, 9:16, 1:1, 4:5.' })}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Canvas</span>
          </button>

          <button
            onClick={() => addToast({ type: 'info', title: 'Adjustment', description: 'Switch to Adjustment tab to tune Brightness, Contrast, Saturation.' })}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors"
          >
            <Sun className="w-3 h-3" />
            <span className="hidden sm:inline">Adjust</span>
          </button>
        </div>

        {/* Right Actions: Split, Duplicate, Detach Audio, Trim */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={splitClipAtPlayhead}
            disabled={!activeClipId}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 disabled:opacity-30 transition-all flex items-center gap-1"
            title="Split Clip"
          >
            <Scissors className="w-2.5 h-2.5 text-zinc-400" />
            <span>Split</span>
          </button>

          <button
            onClick={duplicateSelectedClip}
            disabled={!activeClipId}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 disabled:opacity-30 transition-all flex items-center gap-1"
            title="Duplicate Clip"
          >
            <Copy className="w-2.5 h-2.5 text-zinc-400" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={handleDetachAudio}
            disabled={!activeClipId}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 disabled:opacity-30 transition-all flex items-center gap-1"
            title="Detach Audio from Video"
          >
            <Music className="w-2.5 h-2.5 text-purple-400" />
            <span className="hidden sm:inline">Detach Audio</span>
          </button>

          <button
            onClick={() => addToast({ type: 'info', title: 'Trim', description: 'Drag the yellow handles (< and >) at the ends of the selected clip to trim.' })}
            disabled={!activeClipId}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 disabled:opacity-30 transition-all flex items-center gap-1"
            title="Trim with yellow handles"
          >
            <Film className="w-2.5 h-2.5 text-amber-400" />
            <span>Trim</span>
          </button>
        </div>
      </div>
    </div>
  );
};
