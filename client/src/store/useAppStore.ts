import { useState, useEffect, useCallback } from 'react';
import {
  AppSection,
  MediaItem,
  Project,
  TimelineClip,
  TimelineTrack,
  ToastMessage,
  ExportJobStatus,
  AspectRatio,
  Resolution,
  FrameRate,
  VideoFormat,
  ExportQuality,
  ClipTransition,
  AudioTrackItem,
  StickerData,
  ExportConfig,
} from '../types/index.js';

const DEFAULT_PROJECT: Project = {
  id: 'proj-default',
  title: 'My Masterpiece Project',
  aspectRatio: '16:9',
  resolution: '1080p',
  fps: 30,
  duration: 18,
  thumbnailUrl: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tracks: [
    {
      id: 'track-video-primary',
      type: 'video',
      name: 'Main Video',
      isMuted: false,
      isLocked: false,
      isSolo: false,
      isHidden: false,
      volume: 1,
      clips: [],
    },
    {
      id: 'track-text-primary',
      type: 'text',
      name: 'Titles & Captions',
      isMuted: false,
      isLocked: false,
      isSolo: false,
      isHidden: false,
      volume: 1,
      clips: [],
    },
    {
      id: 'track-audio-primary',
      type: 'audio',
      name: 'Background Music',
      isMuted: false,
      isLocked: false,
      isSolo: false,
      isHidden: false,
      volume: 1,
      clips: [],
    },
  ],
};

const getInitialSection = (): AppSection => {
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search).get('section');
    if (
      p &&
      [
        'dashboard',
        'autoedit',
        'editor',
        'templates',
        'projects',
        'media',
        'export',
        'settings',
        'effects',
        'transitions',
        'audio',
        'ai_tools',
      ].includes(p)
    ) {
      return p as AppSection;
    }
  }
  return 'dashboard';
};

// Global Store State
let globalState = {
  activeSection: getInitialSection(),
  currentProject: null as Project | null,
  projects: [] as Project[],
  mediaLibrary: [] as MediaItem[],
  activeClipId: null as string | null,
  activeTrackId: null as string | null,
  currentTime: 0,
  isPlaying: false,
  zoomLevel: 45, // pixels per second
  snappingEnabled: true,
  onboardingOpen: false,
  assistantOpen: false,
  toasts: [] as ToastMessage[],
  exportConfig: {
    resolution: '1080p' as Resolution,
    fps: 30 as FrameRate,
    aspectRatio: '16:9' as AspectRatio,
    format: 'mp4' as VideoFormat,
    quality: 'high' as ExportQuality,
    canvasMode: 'fit' as 'fit' | 'fill',
    backgroundColor: 'black' as string,
    autoDucking: false as boolean,
    duckingAmount: 0.5 as number,
  } as ExportConfig,
  activeRenderJob: null as ExportJobStatus | null,
  isRenderingModalOpen: false,
  isAnalyzingAI: false,
  aiProgressStage: '',
  aiProgressPercent: 0,

  // Undo / Redo history
  history: [] as Project[],
  historyIndex: -1,

  // Clipboard
  copiedClip: null as TimelineClip | null,

  // Audio Library & Beat Sync
  audioLibrary: [] as AudioTrackItem[],
  audioCategories: [] as Array<{ id: string; name: string; icon: string; count: number }>,
  selectedAudioCategory: 'all',
  beatMarkers: [] as number[],
  snapToBeats: true,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function pushHistory(proj: Project) {
  const cloned = JSON.parse(JSON.stringify(proj));
  const newHist = globalState.history.slice(0, globalState.historyIndex + 1);
  newHist.push(cloned);
  if (newHist.length > 40) {
    newHist.shift();
  }
  globalState.history = newHist;
  globalState.historyIndex = newHist.length - 1;
}

export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id, duration: toast.duration || 4000 };
    globalState.toasts = [...globalState.toasts, newToast];
    notify();

    setTimeout(() => {
      globalState.toasts = globalState.toasts.filter((t) => t.id !== id);
      notify();
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    globalState.toasts = globalState.toasts.filter((t) => t.id !== id);
    notify();
  }, []);

  const setActiveSection = useCallback((section: AppSection) => {
    globalState.activeSection = section;
    if (section !== 'editor') {
      globalState.isPlaying = false;
    }
    notify();
  }, []);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        globalState.mediaLibrary = data.data;
        notify();
      }
    } catch (err) {
      console.warn('Failed to fetch media:', err);
    }
  }, []);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const formData = new FormData();
    const filesArray = Array.from(files);
    if (filesArray.length === 0) return;

    filesArray.forEach((file) => formData.append('files', file));

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned HTTP ${res.status}: ${text.slice(0, 100)}`);
      }

      if (data.success) {
        addToast({
          type: 'success',
          title: 'Upload Successful',
          description: `Imported ${data.uploaded.length} clips into your media library.`,
        });
        await fetchMedia();
      } else {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          description: data.error || 'Check server connection and file format.',
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        description: err.message,
      });
    }
  }, [addToast, fetchMedia]);

  const deleteMedia = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        globalState.mediaLibrary = globalState.mediaLibrary.filter((m) => m.id !== id);
        addToast({
          type: 'info',
          title: 'Media Removed',
          description: 'Asset removed from library.',
        });
        notify();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', description: err.message });
    }
  }, [addToast]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        globalState.projects = data.data;
        if (!globalState.currentProject) {
          const proj = data.data[0];
          globalState.currentProject = proj;
          globalState.history = [JSON.parse(JSON.stringify(proj))];
          globalState.historyIndex = 0;
          globalState.exportConfig.aspectRatio = proj.aspectRatio || '16:9';
        }
        notify();
      } else if (!globalState.currentProject) {
        globalState.currentProject = DEFAULT_PROJECT;
        globalState.history = [JSON.parse(JSON.stringify(DEFAULT_PROJECT))];
        globalState.historyIndex = 0;
        notify();
      }
    } catch (err) {
      console.warn('Failed to fetch projects:', err);
      if (!globalState.currentProject) {
        globalState.currentProject = DEFAULT_PROJECT;
        globalState.history = [JSON.parse(JSON.stringify(DEFAULT_PROJECT))];
        globalState.historyIndex = 0;
        notify();
      }
    }
  }, []);

  const loadProject = useCallback((id: string) => {
    const proj = globalState.projects.find((p) => p.id === id);
    if (proj) {
      globalState.currentProject = JSON.parse(JSON.stringify(proj));
      globalState.history = [JSON.parse(JSON.stringify(proj))];
      globalState.historyIndex = 0;
      globalState.currentTime = 0;
      globalState.isPlaying = false;
      globalState.activeClipId = null;
      globalState.exportConfig.aspectRatio = proj.aspectRatio;
      globalState.activeSection = 'editor';
      notify();
    }
  }, []);

  const createNewProject = useCallback(async (aspectRatio: AspectRatio = '16:9', title = 'Untitled Project') => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          aspectRatio,
          resolution: '1080p',
          fps: 30,
        }),
      });
      const data = await res.json();
      if (data.success) {
        globalState.projects = [data.data, ...globalState.projects];
        globalState.currentProject = data.data;
        globalState.history = [JSON.parse(JSON.stringify(data.data))];
        globalState.historyIndex = 0;
        globalState.currentTime = 0;
        globalState.isPlaying = false;
        globalState.activeClipId = null;
        globalState.activeSection = 'editor';
        addToast({
          type: 'success',
          title: 'Project Created',
          description: `Ready to edit "${data.data.title}".`,
        });
        notify();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to create project', description: err.message });
    }
  }, [addToast]);

  const applyTemplate = useCallback(
    async (templateId: string, mediaIds?: string[], customTitle?: string) => {
      try {
        const res = await fetch(`/api/templates/${templateId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaIds, customTitle }),
        });
        const data = await res.json();
        if (data.success) {
          globalState.currentProject = data.data;
          globalState.projects = [data.data, ...globalState.projects.filter((p) => p.id !== data.data.id)];
          globalState.history = [JSON.parse(JSON.stringify(data.data))];
          globalState.historyIndex = 0;
          globalState.currentTime = 0;
          globalState.isPlaying = false;
          globalState.activeClipId = null;
          globalState.exportConfig.aspectRatio = data.data.aspectRatio || '16:9';
          globalState.activeSection = 'editor';
          notify();
          addToast({
            type: 'success',
            title: 'Template Applied!',
            description: `Loaded "${data.data.title}" into the timeline.`,
          });
          return data.data;
        } else {
          addToast({
            type: 'error',
            title: 'Template Error',
            description: data.error || 'Failed to apply template',
          });
          return null;
        }
      } catch (err: any) {
        addToast({ type: 'error', title: 'Network Error', description: err.message });
        return null;
      }
    },
    [addToast]
  );

  const customizeTemplate = useCallback(
    async (
      templateId: string,
      replacements: {
        slotMedia?: Record<number, string>;
        slotText?: Record<number, string>;
        musicTrackId?: string;
        filter?: string;
        effect?: string;
        customTitle?: string;
      }
    ) => {
      try {
        const res = await fetch(`/api/templates/${templateId}/customize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(replacements),
        });
        const data = await res.json();
        if (data.success) {
          globalState.currentProject = data.data;
          globalState.projects = [data.data, ...globalState.projects.filter((p) => p.id !== data.data.id)];
          globalState.history = [JSON.parse(JSON.stringify(data.data))];
          globalState.historyIndex = 0;
          globalState.currentTime = 0;
          globalState.isPlaying = false;
          globalState.activeClipId = null;
          globalState.exportConfig.aspectRatio = data.data.aspectRatio || '16:9';
          globalState.activeSection = 'editor';
          notify();
          addToast({
            type: 'success',
            title: 'Template Customized!',
            description: `Loaded "${data.data.title}" with your customized slots into the timeline.`,
          });
          return data.data;
        } else {
          addToast({
            type: 'error',
            title: 'Customization Failed',
            description: data.error || 'Could not customize template.',
          });
          return null;
        }
      } catch (err: any) {
        addToast({ type: 'error', title: 'Network Error', description: err.message });
        return null;
      }
    },
    [addToast]
  );

  const saveCurrentProject = useCallback(async () => {
    if (!globalState.currentProject) return;
    try {
      const proj = globalState.currentProject;
      let maxDuration = 0;
      proj.tracks.forEach((t) => {
        t.clips.forEach((c) => {
          const end = c.start + c.duration;
          if (end > maxDuration) maxDuration = end;
        });
      });
      proj.duration = parseFloat(maxDuration.toFixed(2));
      proj.updatedAt = new Date().toISOString();

      const res = await fetch(`/api/projects/${proj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj),
      });
      const data = await res.json();
      if (data.success) {
        const idx = globalState.projects.findIndex((p) => p.id === proj.id);
        if (idx >= 0) {
          globalState.projects[idx] = data.data;
        } else {
          globalState.projects.unshift(data.data);
        }
        addToast({
          type: 'info',
          title: 'Project Saved',
          description: 'All timeline edits saved.',
        });
        notify();
      }
    } catch (err: any) {
      console.warn('Auto-save error:', err);
    }
  }, [addToast]);

  const duplicateProject = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        globalState.projects = [data.data, ...globalState.projects];
        addToast({
          type: 'success',
          title: 'Project Duplicated',
          description: `Created copy "${data.data.title}".`,
        });
        notify();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Duplicate Error', description: err.message });
    }
  }, [addToast]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        globalState.projects = globalState.projects.filter((p) => p.id !== id);
        if (globalState.currentProject?.id === id) {
          globalState.currentProject = globalState.projects[0] || null;
        }
        addToast({
          type: 'info',
          title: 'Project Deleted',
          description: 'Project removed.',
        });
        notify();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Error', description: err.message });
    }
  }, [addToast]);

  const setCurrentTime = useCallback((time: number) => {
    globalState.currentTime = Math.max(0, parseFloat(time.toFixed(2)));
    notify();
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    globalState.isPlaying = playing;
    notify();
  }, []);

  const setZoomLevel = useCallback((zoom: number) => {
    globalState.zoomLevel = Math.max(15, Math.min(120, zoom));
    notify();
  }, []);

  const setSnappingEnabled = useCallback((enabled: boolean) => {
    globalState.snappingEnabled = enabled;
    notify();
  }, []);

  const selectClip = useCallback((clipId: string | null, trackId?: string) => {
    globalState.activeClipId = clipId;
    if (trackId) globalState.activeTrackId = trackId;
    notify();
  }, []);

  // UNDO / REDO
  const undo = useCallback(() => {
    if (globalState.historyIndex > 0) {
      globalState.historyIndex--;
      globalState.currentProject = JSON.parse(JSON.stringify(globalState.history[globalState.historyIndex]));
      notify();
      addToast({ type: 'info', title: 'Undo', description: 'Reverted timeline state.' });
    }
  }, [addToast]);

  const redo = useCallback(() => {
    if (globalState.historyIndex < globalState.history.length - 1) {
      globalState.historyIndex++;
      globalState.currentProject = JSON.parse(JSON.stringify(globalState.history[globalState.historyIndex]));
      notify();
      addToast({ type: 'info', title: 'Redo', description: 'Restored timeline state.' });
    }
  }, [addToast]);

  // CLIPBOARD
  const copySelectedClip = useCallback(() => {
    if (!globalState.currentProject || !globalState.activeClipId) return;
    for (const track of globalState.currentProject.tracks) {
      const clip = track.clips.find((c) => c.id === globalState.activeClipId);
      if (clip) {
        globalState.copiedClip = JSON.parse(JSON.stringify(clip));
        addToast({
          type: 'info',
          title: 'Clip Copied',
          description: `"${clip.text || clip.name}" copied to clipboard.`,
        });
        notify();
        break;
      }
    }
  }, [addToast]);

  const pasteClip = useCallback(() => {
    if (!globalState.currentProject || !globalState.copiedClip) return;
    const proj = { ...globalState.currentProject };
    let targetTrack = proj.tracks.find((t) => t.id === globalState.activeTrackId);
    if (!targetTrack) {
      const isText = !!globalState.copiedClip.text;
      const isAudio = !isText && (!globalState.copiedClip.url || globalState.copiedClip.url.endsWith('.mp3'));
      targetTrack = proj.tracks.find((t) => (isText ? t.type === 'text' : isAudio ? t.type === 'audio' : t.type === 'video')) || proj.tracks[0];
    }
    if (!targetTrack) return;

    const newClip: TimelineClip = {
      ...JSON.parse(JSON.stringify(globalState.copiedClip)),
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      start: parseFloat(globalState.currentTime.toFixed(2)),
    };

    targetTrack.clips.push(newClip);
    targetTrack.clips.sort((a, b) => a.start - b.start);
    pushHistory(proj);
    globalState.currentProject = proj;
    globalState.activeClipId = newClip.id;
    globalState.activeTrackId = targetTrack.id;
    addToast({
      type: 'success',
      title: 'Clip Pasted',
      description: `Placed on "${targetTrack.name}" at playhead.`,
    });
    notify();
  }, [addToast]);

  // TRACK MANAGEMENT
  const addTrack = useCallback((type: 'video' | 'audio' | 'text' | 'sticker' | 'effects', customName?: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const count = proj.tracks.filter((t) => t.type === type).length + 1;
    const defaultNames: Record<string, string> = {
      video: `Video Track ${count}`,
      audio: `Audio Track ${count}`,
      text: `Text Track ${count}`,
      sticker: `Stickers ${count}`,
      effects: `Effects Rack ${count}`,
    };
    const newTrack: TimelineTrack = {
      id: `track-${type}-${Date.now()}`,
      type,
      name: customName || defaultNames[type] || 'New Track',
      isMuted: false,
      isLocked: false,
      isSolo: false,
      isHidden: false,
      volume: 1,
      clips: [],
    };
    if (type === 'audio') {
      proj.tracks.push(newTrack);
    } else {
      const firstAudioIdx = proj.tracks.findIndex((t) => t.type === 'audio');
      if (firstAudioIdx >= 0) {
        proj.tracks.splice(firstAudioIdx, 0, newTrack);
      } else {
        proj.tracks.push(newTrack);
      }
    }
    pushHistory(proj);
    globalState.currentProject = proj;
    notify();
    addToast({ type: 'success', title: 'Track Created', description: `Added "${newTrack.name}".` });
  }, [addToast]);

  const deleteTrack = useCallback((trackId: string) => {
    if (!globalState.currentProject) return;
    if (globalState.currentProject.tracks.length <= 1) {
      addToast({ type: 'warning', title: 'Cannot Delete', description: 'At least one track must remain in timeline.' });
      return;
    }
    const proj = { ...globalState.currentProject };
    proj.tracks = proj.tracks.filter((t) => t.id !== trackId);
    pushHistory(proj);
    globalState.currentProject = proj;
    notify();
    addToast({ type: 'info', title: 'Track Deleted', description: 'Track and clips removed.' });
  }, [addToast]);

  const toggleTrackMute = useCallback((trackId: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const tr = proj.tracks.find((t) => t.id === trackId);
    if (tr) {
      tr.isMuted = !tr.isMuted;
      globalState.currentProject = proj;
      notify();
    }
  }, []);

  const toggleTrackLock = useCallback((trackId: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const tr = proj.tracks.find((t) => t.id === trackId);
    if (tr) {
      tr.isLocked = !tr.isLocked;
      globalState.currentProject = proj;
      notify();
    }
  }, []);

  const toggleTrackVisibility = useCallback((trackId: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const tr = proj.tracks.find((t) => t.id === trackId);
    if (tr) {
      tr.isHidden = !tr.isHidden;
      globalState.currentProject = proj;
      notify();
    }
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const tr = proj.tracks.find((t) => t.id === trackId);
    if (tr) {
      tr.isSolo = !tr.isSolo;
      globalState.currentProject = proj;
      notify();
    }
  }, []);

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const tr = proj.tracks.find((t) => t.id === trackId);
    if (tr) {
      tr.volume = Math.max(0, Math.min(2, volume));
      globalState.currentProject = proj;
      notify();
    }
  }, []);

  const renameTrack = useCallback((trackId: string, name: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const tr = proj.tracks.find((t) => t.id === trackId);
    if (tr) {
      tr.name = name;
      globalState.currentProject = proj;
      notify();
    }
  }, []);

  // CLIP OPERATIONS
  const addMediaToTimeline = useCallback((media: MediaItem, targetTrackType: 'video' | 'audio' = 'video') => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    let track = proj.tracks.find((t) => t.type === targetTrackType);

    if (!track) {
      track = {
        id: `track-${targetTrackType}-${Date.now()}`,
        type: targetTrackType,
        name: targetTrackType === 'video' ? 'Video Track' : 'Audio Track',
        isMuted: false,
        isLocked: false,
        isSolo: false,
        isHidden: false,
        volume: 1,
        clips: [],
      };
      proj.tracks.push(track);
    }

    let start = globalState.currentTime;
    if (globalState.snappingEnabled && track.clips.length > 0) {
      const lastClip = track.clips[track.clips.length - 1];
      start = lastClip.start + lastClip.duration;
    }

    const clipDuration = media.duration || 5;
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mediaId: media.id,
      name: media.name,
      url: media.url,
      start: parseFloat(start.toFixed(2)),
      duration: clipDuration,
      trimStart: 0,
      trimEnd: clipDuration,
      speed: 1,
      volume: 1,
      filter: 'none',
      transition: { type: 'none', duration: 0 },
      positionX: 0,
      positionY: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
    };

    track.clips.push(newClip);
    let max = 0;
    proj.tracks.forEach((t) => t.clips.forEach((c) => { if (c.start + c.duration > max) max = c.start + c.duration; }));
    proj.duration = parseFloat(max.toFixed(2));

    pushHistory(proj);
    globalState.currentProject = proj;
    globalState.activeClipId = newClip.id;
    globalState.activeTrackId = track.id;
    addToast({
      type: 'success',
      title: 'Added to Timeline',
      description: `"${media.name}" placed on ${track.name}.`,
    });
    notify();
  }, [addToast]);

  const addTextToTimeline = useCallback((text = 'New Title', stylePreset: any = {}) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    let track = proj.tracks.find((t) => t.type === 'text');

    if (!track) {
      track = {
        id: `track-text-${Date.now()}`,
        type: 'text',
        name: 'Titles & Captions',
        isMuted: false,
        isLocked: false,
        isSolo: false,
        isHidden: false,
        volume: 1,
        clips: [],
      };
      proj.tracks.unshift(track);
    }

    const start = globalState.currentTime;
    const newClip: TimelineClip = {
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: text,
      text,
      start: parseFloat(start.toFixed(2)),
      duration: 3.5,
      trimStart: 0,
      trimEnd: 3.5,
      speed: 1,
      volume: 0,
      positionX: 0,
      positionY: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      style: {
        fontSize: stylePreset.fontSize || 42,
        fontWeight: stylePreset.fontWeight || 'bold',
        fontFamily: stylePreset.fontFamily || 'Plus Jakarta Sans',
        color: stylePreset.color || '#ffffff',
        position: stylePreset.position || 'center',
        animation: stylePreset.animation || 'pop',
      },
    };

    track.clips.push(newClip);
    pushHistory(proj);
    globalState.currentProject = proj;
    globalState.activeClipId = newClip.id;
    globalState.activeTrackId = track.id;
    addToast({
      type: 'success',
      title: 'Text Added',
      description: 'Title layer added to timeline.',
    });
    notify();
  }, [addToast]);

  const addStickerToTimeline = useCallback((sticker: StickerData) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    let track = proj.tracks.find((t) => t.type === 'sticker' || t.name === 'Stickers & Overlays');
    if (!track) {
      track = {
        id: `track-sticker-${Date.now()}`,
        type: 'sticker',
        name: 'Stickers & Overlays',
        isMuted: false,
        isLocked: false,
        isSolo: false,
        isHidden: false,
        volume: 1,
        clips: [],
      };
      proj.tracks.unshift(track);
    }

    const start = globalState.currentTime;
    const newClip: TimelineClip = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: sticker.content,
      start: parseFloat(start.toFixed(2)),
      duration: 3,
      trimStart: 0,
      trimEnd: 3,
      speed: 1,
      volume: 0,
      positionX: 0,
      positionY: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      sticker,
    };

    track.clips.push(newClip);
    pushHistory(proj);
    globalState.currentProject = proj;
    globalState.activeClipId = newClip.id;
    globalState.activeTrackId = track.id;
    addToast({ type: 'success', title: 'Element Placed', description: `Added ${sticker.content} to timeline.` });
    notify();
  }, [addToast]);

  const addAudioToTimeline = useCallback((item: AudioTrackItem) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    let track = proj.tracks.find((t) => t.type === 'audio');
    if (!track) {
      track = {
        id: `track-audio-${Date.now()}`,
        type: 'audio',
        name: 'Background Music',
        isMuted: false,
        isLocked: false,
        isSolo: false,
        isHidden: false,
        volume: 1,
        clips: [],
      };
      proj.tracks.push(track);
    }

    let start = globalState.currentTime;
    if (globalState.snappingEnabled && track.clips.length > 0) {
      const lastClip = track.clips[track.clips.length - 1];
      start = lastClip.start + lastClip.duration;
    }

    const dur = item.duration || 30;
    const newClip: TimelineClip = {
      id: `audio-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: item.name,
      url: item.url,
      start: parseFloat(start.toFixed(2)),
      duration: dur,
      trimStart: 0,
      trimEnd: dur,
      speed: 1,
      volume: 0.8,
      peaks: item.peaks || [],
    };

    track.clips.push(newClip);
    let max = 0;
    proj.tracks.forEach((t) => t.clips.forEach((c) => { if (c.start + c.duration > max) max = c.start + c.duration; }));
    proj.duration = parseFloat(max.toFixed(2));

    pushHistory(proj);
    globalState.currentProject = proj;
    globalState.activeClipId = newClip.id;
    globalState.activeTrackId = track.id;
    addToast({ type: 'success', title: 'Music Added', description: `"${item.name}" placed on timeline.` });
    notify();
  }, [addToast]);

  const updateClip = useCallback((trackId: string, clipId: string, patch: Partial<TimelineClip>) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const track = proj.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const clipIdx = track.clips.findIndex((c) => c.id === clipId);
    if (clipIdx === -1) return;

    track.clips[clipIdx] = { ...track.clips[clipIdx], ...patch };
    globalState.currentProject = proj;
    notify();
  }, []);

  const moveClip = useCallback((trackId: string, clipId: string, newStart: number, targetTrackId?: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const sourceTrack = proj.tracks.find((t) => t.id === trackId);
    if (!sourceTrack) return;
    const clipIdx = sourceTrack.clips.findIndex((c) => c.id === clipId);
    if (clipIdx === -1) return;

    const [clip] = sourceTrack.clips.splice(clipIdx, 1);
    clip.start = Math.max(0, parseFloat(newStart.toFixed(2)));

    const destTrack = targetTrackId ? proj.tracks.find((t) => t.id === targetTrackId) || sourceTrack : sourceTrack;
    destTrack.clips.push(clip);
    destTrack.clips.sort((a, b) => a.start - b.start);

    let max = 0;
    proj.tracks.forEach((t) => t.clips.forEach((c) => { if (c.start + c.duration > max) max = c.start + c.duration; }));
    proj.duration = parseFloat(max.toFixed(2));

    pushHistory(proj);
    globalState.currentProject = proj;
    notify();
  }, []);

  const detachAudio = useCallback((trackId: string, clipId: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const track = proj.tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!clip || !clip.url) return;

    clip.volume = 0;
    clip.isMuted = true;

    let audioTrack = proj.tracks.find((t) => t.type === 'audio');
    if (!audioTrack) {
      audioTrack = {
        id: `track-audio-${Date.now()}`,
        type: 'audio',
        name: 'Extracted Audio',
        isMuted: false,
        isLocked: false,
        isSolo: false,
        isHidden: false,
        volume: 1,
        clips: [],
      };
      proj.tracks.push(audioTrack);
    }

    const audioClip: TimelineClip = {
      id: `audio-ext-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: `${clip.name} (Audio)`,
      url: clip.url,
      start: clip.start,
      duration: clip.duration,
      trimStart: clip.trimStart || 0,
      trimEnd: clip.trimEnd || clip.duration,
      speed: clip.speed || 1,
      volume: 1,
      isMuted: false,
    };

    audioTrack.clips.push(audioClip);
    audioTrack.clips.sort((a, b) => a.start - b.start);
    pushHistory(proj);
    globalState.currentProject = proj;
    addToast({
      type: 'success',
      title: 'Audio Detached',
      description: `Separated into dedicated audio clip on "${audioTrack.name}".`,
    });
    notify();
  }, [addToast]);

  const reverseClip = useCallback((trackId: string, clipId: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const track = proj.tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!clip) return;
    clip.reverse = !clip.reverse;
    pushHistory(proj);
    globalState.currentProject = proj;
    addToast({
      type: 'info',
      title: clip.reverse ? 'Clip Reversed' : 'Standard Direction',
      description: clip.reverse ? 'Clip is set to play backwards.' : 'Clip plays in forward direction.',
    });
    notify();
  }, [addToast]);

  const freezeFrame = useCallback((trackId: string, clipId: string, duration = 2) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const track = proj.tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!clip || !track) return;

    const freezeClip: TimelineClip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `freeze-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: `${clip.name} [Hold]`,
      start: parseFloat((clip.start + clip.duration).toFixed(2)),
      duration,
      isFreeze: true,
    };
    track.clips.push(freezeClip);
    track.clips.sort((a, b) => a.start - b.start);
    pushHistory(proj);
    globalState.currentProject = proj;
    addToast({
      type: 'success',
      title: 'Freeze Frame Inserted',
      description: `Created ${duration}s hold frame.`,
    });
    notify();
  }, [addToast]);

  const applyTransitionToAll = useCallback((transition: ClipTransition) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const videoTracks = proj.tracks.filter((t) => t.type === 'video');
    let count = 0;
    videoTracks.forEach((vt) => {
      vt.clips.forEach((c, idx) => {
        if (idx < vt.clips.length - 1) {
          c.transition = { ...transition };
          count++;
        }
      });
    });
    pushHistory(proj);
    globalState.currentProject = proj;
    addToast({
      type: 'success',
      title: 'Transitions Applied',
      description: `Applied ${transition.type} (${transition.duration}s) to ${count} clip transitions.`,
    });
    notify();
  }, [addToast]);

  const removeTransition = useCallback((trackId: string, clipId: string) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const track = proj.tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);
    if (clip) {
      clip.transition = { type: 'none', duration: 0 };
      pushHistory(proj);
      globalState.currentProject = proj;
      notify();
    }
  }, []);

  const deleteSelectedClip = useCallback(() => {
    if (!globalState.currentProject || !globalState.activeClipId) return;
    const proj = { ...globalState.currentProject };
    proj.tracks.forEach((track) => {
      track.clips = track.clips.filter((c) => c.id !== globalState.activeClipId);
    });
    globalState.activeClipId = null;
    pushHistory(proj);
    globalState.currentProject = proj;
    addToast({ type: 'info', title: 'Clip Deleted', description: 'Removed from timeline.' });
    notify();
  }, [addToast]);

  const splitClipAtPlayhead = useCallback(() => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject };
    const playhead = globalState.currentTime;

    let didSplit = false;
    proj.tracks.forEach((track) => {
      const targetClip = track.clips.find(
        (c) =>
          playhead > c.start + 0.1 &&
          playhead < c.start + c.duration - 0.1 &&
          (!globalState.activeClipId || c.id === globalState.activeClipId)
      );

      if (targetClip) {
        const offset = playhead - targetClip.start;
        const firstPartDur = parseFloat(offset.toFixed(2));
        const secondPartDur = parseFloat((targetClip.duration - offset).toFixed(2));

        const secondPart: TimelineClip = {
          ...JSON.parse(JSON.stringify(targetClip)),
          id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          start: parseFloat(playhead.toFixed(2)),
          duration: secondPartDur,
          trimStart: parseFloat(((targetClip.trimStart || 0) + offset).toFixed(2)),
          trimEnd: targetClip.trimEnd,
        };

        targetClip.duration = firstPartDur;
        targetClip.trimEnd = parseFloat(((targetClip.trimStart || 0) + offset).toFixed(2));

        track.clips.push(secondPart);
        track.clips.sort((a, b) => a.start - b.start);
        didSplit = true;
      }
    });

    if (didSplit) {
      pushHistory(proj);
      globalState.currentProject = proj;
      addToast({
        type: 'success',
        title: 'Clip Cut at Playhead',
        description: 'Successfully split into two clips.',
      });
      notify();
    } else {
      addToast({
        type: 'warning',
        title: 'Split Notice',
        description: 'Position playhead within a clip to cut.',
      });
    }
  }, [addToast]);

  const duplicateSelectedClip = useCallback(() => {
    if (!globalState.currentProject || !globalState.activeClipId) return;
    const proj = { ...globalState.currentProject };
    let duplicated: TimelineClip | null = null;

    proj.tracks.forEach((track) => {
      const original = track.clips.find((c) => c.id === globalState.activeClipId);
      if (original) {
        const dupClip: TimelineClip = {
          ...JSON.parse(JSON.stringify(original)),
          id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          start: parseFloat((original.start + original.duration + 0.2).toFixed(2)),
        };
        duplicated = dupClip;
        track.clips.push(dupClip);
        track.clips.sort((a, b) => a.start - b.start);
      }
    });

    if (duplicated) {
      pushHistory(proj);
      globalState.currentProject = proj;
      globalState.activeClipId = (duplicated as TimelineClip).id;
      addToast({
        type: 'success',
        title: 'Clip Duplicated',
        description: 'Created duplicate clip on track.',
      });
      notify();
    }
  }, [addToast]);

  // AUDIO CATALOG & BEAT SYNC
  const fetchAudioCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/audio/categories');
      const data = await res.json();
      if (data.success) {
        globalState.audioCategories = data.data;
        notify();
      }
    } catch (e) {
      console.warn('Failed to load audio categories:', e);
    }
  }, []);

  const fetchAudioLibrary = useCallback(async (category?: string, search?: string) => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('query', search);
      const res = await fetch(`/api/audio/library?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        globalState.audioLibrary = data.data;
        notify();
      }
    } catch (e) {
      console.warn('Failed to fetch audio library:', e);
    }
  }, []);

  const setSelectedAudioCategory = useCallback((cat: string) => {
    globalState.selectedAudioCategory = cat;
    notify();
  }, []);

  const fetchAudioBeats = useCallback(async (duration = 30, bpm = 120) => {
    try {
      const res = await fetch('/api/audio/beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, bpm }),
      });
      const data = await res.json();
      if (data.success) {
        globalState.beatMarkers = data.data.beats || [];
        notify();
      }
    } catch (e) {
      console.warn('Beat detection error:', e);
    }
  }, []);

  const setSnapToBeats = useCallback((enabled: boolean) => {
    globalState.snapToBeats = enabled;
    notify();
  }, []);

  const autoSyncCutsToBeats = useCallback(() => {
    if (!globalState.currentProject || globalState.beatMarkers.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Beats Detected',
        description: 'Load an audio track with beats first.',
      });
      return;
    }
    const proj = { ...globalState.currentProject };
    const mainVideoTrack = proj.tracks.find((t) => t.type === 'video');
    if (!mainVideoTrack || mainVideoTrack.clips.length === 0) return;

    const beats = [...globalState.beatMarkers].sort((a, b) => a - b);
    let syncedCuts = 0;

    mainVideoTrack.clips.forEach((clip) => {
      const nearestBeat = beats.reduce((prev, curr) =>
        Math.abs(curr - clip.start) < Math.abs(prev - clip.start) ? curr : prev
      );
      if (Math.abs(nearestBeat - clip.start) < 0.8) {
        clip.start = nearestBeat;
        syncedCuts++;
      }
    });

    mainVideoTrack.clips.sort((a, b) => a.start - b.start);
    pushHistory(proj);
    globalState.currentProject = proj;
    notify();
    addToast({
      type: 'success',
      title: 'Beat Sync Applied! 🎵',
      description: `Snapped ${syncedCuts} clip cuts to musical rhythm beats.`,
    });
  }, [addToast]);

  const exportSubtitles = useCallback(async (format: 'srt' | 'vtt' = 'srt') => {
    if (!globalState.currentProject) return;
    const captionTrack = globalState.currentProject.tracks.find(
      (t) => t.type === 'text' && (t.name.toLowerCase().includes('caption') || t.name.toLowerCase().includes('subtitle'))
    ) || globalState.currentProject.tracks.find((t) => t.type === 'text');

    if (!captionTrack || captionTrack.clips.length === 0) {
      addToast({ type: 'warning', title: 'No Subtitles Found', description: 'Generate captions first before downloading.' });
      return;
    }

    try {
      const res = await fetch('/api/ai/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captions: captionTrack.clips.map((c) => ({
            text: c.text || c.name,
            start: c.start,
            end: c.start + c.duration,
          })),
          format,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([data.data.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${globalState.currentProject.title.replace(/\s+/g, '_')}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        addToast({ type: 'success', title: 'Subtitles Exported', description: `Downloaded ${data.data.filename}.` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Export Failed', description: err.message });
    }
  }, [addToast]);

  const setExportConfig = useCallback((patch: Partial<typeof globalState.exportConfig>) => {
    globalState.exportConfig = { ...globalState.exportConfig, ...patch };
    notify();
  }, []);

  const runAIAutoEdit = useCallback(
    async (opts: {
      mediaIds: string[];
      style: string;
      aspectRatio: AspectRatio;
      targetDuration?: number;
      selectedBgmId?: string;
      muteOriginalAudio?: boolean;
      bgmVolume?: number;
    }) => {
      globalState.isAnalyzingAI = true;
      globalState.aiProgressPercent = 10;
      globalState.aiProgressStage = 'Analyzing visual salience and speech clarity...';
      notify();

      const stages = [
        { pct: 25, stage: 'Detecting silence and trimming redundant takes...' },
        { pct: 50, stage: 'Selecting salient highlight moments...' },
        { pct: 70, stage: 'Generating rhythm-matched cuts and transitions...' },
        { pct: 88, stage: 'Harmonizing color grades and mixing background music...' },
      ];

      for (const s of stages) {
        await new Promise((r) => setTimeout(r, 600));
        globalState.aiProgressPercent = s.pct;
        globalState.aiProgressStage = s.stage;
        notify();
      }

      try {
        const res = await fetch('/api/ai/auto-edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opts),
        });
        const data = await res.json();

        globalState.isAnalyzingAI = false;
        if (data.success) {
          const generatedTimeline = data.data;
          const newProj: Project = {
            id: `proj-${Date.now().toString(36)}`,
            title: `AI Edit: ${opts.style}`,
            aspectRatio: opts.aspectRatio,
            resolution: '1080p',
            fps: 30,
            duration: generatedTimeline.duration,
            thumbnailUrl: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tracks: generatedTimeline.tracks,
          };

          globalState.projects.unshift(newProj);
          globalState.currentProject = newProj;
          globalState.history = [JSON.parse(JSON.stringify(newProj))];
          globalState.historyIndex = 0;
          globalState.currentTime = 0;
          globalState.activeSection = 'editor';
          addToast({
            type: 'success',
            title: 'AI Auto Edit Complete!',
            description: `Generated a polished ${generatedTimeline.duration}s ${opts.style} video with ${generatedTimeline.summary.cutsMade} cuts!`,
          });
        } else {
          addToast({
            type: 'error',
            title: 'Auto Edit Failed',
            description: data.error,
          });
        }
        notify();
      } catch (err: any) {
        globalState.isAnalyzingAI = false;
        addToast({ type: 'error', title: 'Network Error', description: err.message });
        notify();
      }
    },
    [addToast]
  );

  const runAIAssistant = useCallback(
    async (command: string) => {
      if (!globalState.currentProject) return;
      try {
        const res = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command,
            project: globalState.currentProject,
          }),
        });
        const data = await res.json();
        if (data.success) {
          pushHistory(data.data.project);
          globalState.currentProject = data.data.project;
          addToast({
            type: 'success',
            title: 'AI Command Applied',
            description: data.data.message,
          });
          notify();
        }
      } catch (err: any) {
        addToast({ type: 'error', title: 'AI Assistant Error', description: err.message });
      }
    },
    [addToast]
  );

  const generateCaptions = useCallback(async () => {
    if (!globalState.currentProject) return;
    try {
      const res = await fetch('/api/ai/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: globalState.currentProject.duration || 20 }),
      });
      const data = await res.json();
      if (data.success) {
        const captions = data.data;
        const captionClips: TimelineClip[] = captions.map((c: any) => ({
          id: c.id,
          name: c.text,
          text: c.text,
          start: c.start,
          duration: parseFloat((c.end - c.start).toFixed(2)),
          trimStart: 0,
          trimEnd: parseFloat((c.end - c.start).toFixed(2)),
          speed: 1,
          volume: 0,
          style: c.style,
        }));

        const proj = { ...globalState.currentProject };
        const existingTrack = proj.tracks.find((t) => t.name === 'Auto Captions');
        if (existingTrack) {
          existingTrack.clips = captionClips;
        } else {
          proj.tracks.splice(1, 0, {
            id: `track-captions-${Date.now()}`,
            type: 'text',
            name: 'Auto Captions',
            isMuted: false,
            isLocked: false,
            isSolo: false,
            isHidden: false,
            volume: 1,
            clips: captionClips,
          });
        }
        pushHistory(proj);
        globalState.currentProject = proj;
        addToast({
          type: 'success',
          title: 'Auto Captions Generated',
          description: `Created ${captions.length} synchronized speech captions.`,
        });
        notify();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Caption Error', description: err.message });
    }
  }, [addToast]);

  const startExport = useCallback(async () => {
    if (!globalState.currentProject) return;
    const proj = globalState.currentProject;

    const videoClips: any[] = [];
    const audioClips: any[] = [];
    const textClips: any[] = [];
    const captions: any[] = [];

    proj.tracks.forEach((t) => {
      if (t.type === 'video') {
        t.clips.forEach((c) => {
          const trackVol = t.volume !== undefined ? t.volume : 1;
          const clipVol = c.volume !== undefined ? c.volume : 1;
          const isMuted = Boolean(t.isMuted || c.isMuted);
          videoClips.push({
            ...c,
            volume: isMuted ? 0 : clipVol * trackVol,
            isMuted,
          });
        });
      } else if (t.type === 'audio') {
        t.clips.forEach((c) => {
          const trackVol = t.volume !== undefined ? t.volume : 1;
          const clipVol = c.volume !== undefined ? c.volume : 1;
          const isMuted = Boolean(t.isMuted || c.isMuted);
          audioClips.push({
            ...c,
            volume: isMuted ? 0 : clipVol * trackVol,
            isMuted,
          });
        });
      } else if (t.type === 'text') {
        t.clips.forEach((c) => {
          if (!t.isHidden) {
            textClips.push({
              id: c.id,
              text: c.text || c.name,
              start: c.start,
              duration: c.duration,
              style: c.style,
            });
          }
        });
      }
    });

    videoClips.sort((a, b) => (a.start || 0) - (b.start || 0));
    audioClips.sort((a, b) => (a.start || 0) - (b.start || 0));

    if (videoClips.length === 0) {
      addToast({
        type: 'warning',
        title: 'Empty Video Track',
        description: 'Add at least one video clip before exporting.',
      });
      return;
    }

    globalState.isRenderingModalOpen = true;
    globalState.activeRenderJob = {
      jobId: 'init',
      status: 'rendering',
      stage: 'Preparing timeline data & FFmpeg filtergraph...',
      progress: 5,
    };
    notify();

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: proj.id,
          title: proj.title,
          clips: videoClips,
          audioTracks: audioClips,
          textClips,
          captions,
          aspectRatio: globalState.exportConfig.aspectRatio,
          resolution: globalState.exportConfig.resolution,
          fps: globalState.exportConfig.fps,
          format: globalState.exportConfig.format,
          quality: globalState.exportConfig.quality,
          canvasMode: globalState.exportConfig.canvasMode || 'fit',
          backgroundColor: globalState.exportConfig.backgroundColor || 'black',
          autoDucking: globalState.exportConfig.autoDucking || false,
          duckingAmount: globalState.exportConfig.duckingAmount || 0.5,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const jobId = data.data.jobId;
        globalState.activeRenderJob = {
          jobId,
          status: 'rendering',
          stage: data.data.stage,
          progress: data.data.progress,
        };
        notify();

        const interval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/render/status/${jobId}`);
            const statusData = await statusRes.json();
            if (statusData.success) {
              const job: ExportJobStatus = statusData.data;
              globalState.activeRenderJob = job;
              notify();

              if (job.status === 'completed') {
                clearInterval(interval);
                addToast({
                  type: 'success',
                  title: 'Video Render Complete! 🎉',
                  description: 'Your high-quality video is ready for download.',
                });
              } else if (job.status === 'failed') {
                clearInterval(interval);
                addToast({
                  type: 'error',
                  title: 'Render Failed',
                  description: job.error || 'FFmpeg failed to encode timeline.',
                });
              }
            }
          } catch (e) {
            console.warn('Poll error:', e);
          }
        }, 1200);
      } else {
        globalState.activeRenderJob = {
          jobId: 'failed',
          status: 'failed',
          stage: 'Error initializing export',
          progress: 0,
          error: data.error,
        };
        notify();
      }
    } catch (err: any) {
      globalState.activeRenderJob = {
        jobId: 'failed',
        status: 'failed',
        stage: 'Failed to start export',
        progress: 0,
        error: err.message,
      };
      notify();
    }
  }, [addToast]);

  const closeRenderingModal = useCallback(() => {
    globalState.isRenderingModalOpen = false;
    notify();
  }, []);

  const setOnboardingOpen = useCallback((open: boolean) => {
    globalState.onboardingOpen = open;
    notify();
  }, []);

  const setAssistantOpen = useCallback((open: boolean) => {
    globalState.assistantOpen = open;
    notify();
  }, []);

  const updateProject = useCallback((patch: Partial<Project>) => {
    if (!globalState.currentProject) return;
    const proj = { ...globalState.currentProject, ...patch };
    pushHistory(proj);
    globalState.currentProject = proj;
    notify();
  }, []);

  return {
    ...globalState,
    canUndo: globalState.historyIndex > 0,
    canRedo: globalState.historyIndex < globalState.history.length - 1,
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
    setTrackVolume,
    renameTrack,
    moveClip,
    detachAudio,
    reverseClip,
    freezeFrame,
    applyTransitionToAll,
    removeTransition,
    addStickerToTimeline,
    addAudioToTimeline,
    fetchAudioCategories,
    fetchAudioLibrary,
    setSelectedAudioCategory,
    fetchAudioBeats,
    setSnapToBeats,
    autoSyncCutsToBeats,
    exportSubtitles,
    setActiveSection,
    fetchMedia,
    uploadFiles,
    deleteMedia,
    fetchProjects,
    loadProject,
    createNewProject,
    applyTemplate,
    customizeTemplate,
    saveCurrentProject,
    duplicateProject,
    deleteProject,
    setCurrentTime,
    setIsPlaying,
    setZoomLevel,
    setSnappingEnabled,
    selectClip,
    addMediaToTimeline,
    addTextToTimeline,
    updateClip,
    deleteSelectedClip,
    splitClipAtPlayhead,
    duplicateSelectedClip,
    setExportConfig,
    runAIAutoEdit,
    runAIAssistant,
    generateCaptions,
    startExport,
    closeRenderingModal,
    setOnboardingOpen,
    setAssistantOpen,
    updateProject,
    addToast,
    removeToast,
  };
}
