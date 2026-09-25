import React, { useState, useEffect, useRef } from 'react';
import {
  FileVideo,
  Music,
  Type,
  Smile,
  Layers,
  Palette,
  Sliders,
  Sparkles,
  Gauge,
  Square,
  Maximize2,
  Subtitles,
  Wand2,
  Search,
  Play,
  Pause,
  Plus,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Volume2,
  VolumeX,
  Trash2,
  Zap,
  Flame,
  Radio,
  Video,
  Sun,
  Contrast,
  Eye,
  RefreshCw,
  Image,
  Settings,
  Folder,
  Scissors,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { MediaItem, TransitionType, AudioTrackItem, AspectRatio, Resolution, VideoAdjustment } from '../../types/index.js';
import { formatDuration } from '../../utils/time.js';

type ToolId =
  | 'media'
  | 'video'
  | 'photo'
  | 'audio'
  | 'text'
  | 'transitions'
  | 'effects'
  | 'filters'
  | 'stickers'
  | 'adjust'
  | 'bg_removal'
  | 'background'
  | 'speed'
  | 'canvas'
  | 'captions'
  | 'ai_tools'
  | 'settings';

interface ToolItem {
  id: ToolId;
  label: string;
  icon: React.ElementType;
}

const TOOLS: ToolItem[] = [
  { id: 'media', label: 'Media', icon: Folder },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'photo', label: 'Photo', icon: Image },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'captions', label: 'Captions', icon: Subtitles },
  { id: 'effects', label: 'Effects', icon: Layers },
  { id: 'filters', label: 'Filters', icon: Palette },
  { id: 'transitions', label: 'Transitions', icon: Sparkles },
  { id: 'adjust', label: 'Adjustments', icon: Sliders },
  { id: 'speed', label: 'Speed', icon: Gauge },
  { id: 'bg_removal', label: 'Cutout', icon: Wand2 },
  { id: 'ai_tools', label: 'AI Tools', icon: Sparkles },
  { id: 'canvas', label: 'Canvas', icon: Square },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const EditorPanels: React.FC = () => {
  const {
    mediaLibrary,
    uploadFiles,
    fetchMedia,
    addTrack,
    addMediaToTimeline,
    addTextToTimeline,
    addStickerToTimeline,
    addAudioToTimeline,
    activeClipId,
    updateClip,
    audioCategories,
    fetchAudioCategories,
    audioLibrary,
    fetchAudioLibrary,
    fetchAudioBeats,
    autoSyncCutsToBeats,
    currentProject,
    updateProject,
    setExportConfig,
    exportConfig,
    addToast,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<ToolId>('media');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Media state
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Audio state
  const [audioSearch, setAudioSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Transitions state
  const [transitionDuration, setTransitionDuration] = useState(0.6);

  // Effects & Filters Category Filters
  const [effectCategory, setEffectCategory] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Dedicated Background Removal State
  const [bgRemovalTab, setBgRemovalTab] = useState<'ai_cutout' | 'chroma_key'>('ai_cutout');
  const [bgRemovalMode, setBgRemovalMode] = useState<'transparent' | 'color' | 'blur' | 'custom_image'>('transparent');
  const [bgRemovalColor, setBgRemovalColor] = useState('#00ff00');
  const [bgRemovalFeather, setBgRemovalFeather] = useState(5);
  const [bgRemovalIterations, setBgRemovalIterations] = useState(5);
  const [bgRemovalScale, setBgRemovalScale] = useState(1.0);
  const [bgRemovalPosX, setBgRemovalPosX] = useState(0);
  const [bgRemovalPosY, setBgRemovalPosY] = useState(0);
  const [bgRemovalBgOpacity, setBgRemovalBgOpacity] = useState(1.0);
  const [bgRemovalCustomImage, setBgRemovalCustomImage] = useState<string>('');
  const [bgRemovalSelectedMediaId, setBgRemovalSelectedMediaId] = useState<string>('');
  const [bgRemovalStatus, setBgRemovalStatus] = useState<{ isAvailable?: boolean; activeEngine?: string; engineDescription?: string; engine?: string; message?: string } | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalResult, setBgRemovalResult] = useState<any | null>(null);

  // Speech Recognition Status State
  const [speechStatus, setSpeechStatus] = useState<{ available: boolean; engine: string; message: string } | null>(null);

  useEffect(() => {
    fetchAudioCategories();
    fetchAudioLibrary();

    fetch('/api/ai/background-removal/status')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBgRemovalStatus(d.data);
      })
      .catch(() => {});

    fetch('/api/ai/speech-to-text/status')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSpeechStatus(d.data);
      })
      .catch(() => {});
  }, [fetchAudioCategories, fetchAudioLibrary]);

  const handleTabClick = (tabId: ToolId) => {
    if (tabId === 'video') {
      setMediaFilter('video');
      if (activeTab === 'media' && isDrawerOpen && mediaFilter === 'video') {
        setIsDrawerOpen(false);
      } else {
        setActiveTab('media');
        setIsDrawerOpen(true);
      }
      return;
    }
    if (tabId === 'photo') {
      setMediaFilter('image');
      if (activeTab === 'media' && isDrawerOpen && mediaFilter === 'image') {
        setIsDrawerOpen(false);
      } else {
        setActiveTab('media');
        setIsDrawerOpen(true);
      }
      return;
    }
    if (tabId === 'media') {
      setMediaFilter('all');
      if (activeTab === 'media' && isDrawerOpen && mediaFilter === 'all') {
        setIsDrawerOpen(false);
      } else {
        setActiveTab('media');
        setIsDrawerOpen(true);
      }
      return;
    }

    if (activeTab === tabId) {
      setIsDrawerOpen(!isDrawerOpen);
    } else {
      setActiveTab(tabId);
      setIsDrawerOpen(true);
    }
  };

  const handleAudioCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    fetchAudioLibrary(catId, audioSearch);
  };

  const handleAudioSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAudioSearch(val);
    fetchAudioLibrary(selectedCategory, val);
  };

  const toggleAudioPlay = (item: AudioTrackItem) => {
    if (playingAudioId === item.id) {
      audioPreviewRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(item.url);
      } else {
        audioPreviewRef.current.src = item.url;
      }
      audioPreviewRef.current.play().catch(() => {});
      setPlayingAudioId(item.id);
      audioPreviewRef.current.onended = () => setPlayingAudioId(null);
    }
  };

  // Helper to get active video clip or first video clip
  const getTargetVideoClip = () => {
    if (activeClipId && currentProject) {
      for (const track of currentProject.tracks) {
        if (track.type === 'video') {
          const clip = track.clips.find((c) => c.id === activeClipId);
          if (clip) return { trackId: track.id, clip };
        }
      }
    }
    const videoTrack = currentProject?.tracks.find((t) => t.type === 'video' && t.clips.length > 0);
    if (videoTrack && videoTrack.clips.length > 0) {
      return { trackId: videoTrack.id, clip: videoTrack.clips[0] };
    }
    return null;
  };

  const targetVideo = getTargetVideoClip();
  const targetClip = targetVideo?.clip;
  const activeClipFilter = targetClip?.filter || 'none';
  const activeClipEffects = targetClip?.effects || [];
  const currentAdjustments = targetClip?.adjustments || {};

  const handleAdjustmentChange = (field: keyof VideoAdjustment, value: number) => {
    if (!targetVideo) {
      addToast({
        type: 'warning',
        title: 'No Video Clip Selected',
        description: 'Select a video clip on the timeline to adjust color/light.',
      });
      return;
    }
    updateClip(targetVideo.trackId, targetVideo.clip.id, {
      adjustments: { ...currentAdjustments, [field]: value },
    });
  };

  const resetAllAdjustments = () => {
    if (!targetVideo) return;
    updateClip(targetVideo.trackId, targetVideo.clip.id, {
      adjustments: {
        exposure: 0,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        temperature: 0,
        tint: 0,
        vibrance: 0,
        hue: 0,
        fade: 0,
        sharpness: 0,
        clarity: 0,
        grain: 0,
        vignette: 0,
        blur: 0,
      },
    });
    addToast({
      type: 'info',
      title: 'Adjustments Reset',
      description: 'Color adjustments restored to neutral defaults.',
    });
  };

  const applyEffectToTarget = (effId: string, intensity: number) => {
    const target = getTargetVideoClip();
    if (!target) {
      addToast({
        type: 'warning',
        title: 'No Video Clip Selected',
        description: 'Add or select a video clip on the timeline first.',
      });
      return;
    }
    const current = target.clip.effects || [];
    const exists = current.find((e) => e.type === effId);
    const updated = exists
      ? current.filter((e) => e.type !== effId)
      : [...current, { id: `eff-${Date.now()}-${Math.random()}`, type: effId, intensity, enabled: true }];

    updateClip(target.trackId, target.clip.id, { effects: updated });
    addToast({
      type: 'success',
      title: exists ? 'Effect Removed' : 'Effect Applied',
      description: `${exists ? 'Disabled' : 'Enabled'} ${effId} on ${target.clip.name || 'clip'}.`,
    });
  };

  const applyEffectToAllClips = (effId: string, intensity: number) => {
    if (!currentProject) return;
    const videoTracks = currentProject.tracks.filter((t) => t.type === 'video');
    let total = 0;
    videoTracks.forEach((vt) => {
      vt.clips.forEach((c) => {
        const current = c.effects || [];
        const exists = current.find((e) => e.type === effId);
        const updated = exists
          ? current.filter((e) => e.type !== effId)
          : [...current, { id: `eff-${Date.now()}-${Math.random()}`, type: effId, intensity, enabled: true }];
        updateClip(vt.id, c.id, { effects: updated });
        total++;
      });
    });
    addToast({
      type: 'success',
      title: 'Effect Applied to All Clips',
      description: `Toggled ${effId} across all ${total} video clips.`,
    });
  };

  const applyFilterToTarget = (filterId: string) => {
    const target = getTargetVideoClip();
    if (!target) {
      addToast({
        type: 'warning',
        title: 'No Video Clip Selected',
        description: 'Add or select a video clip on the timeline first.',
      });
      return;
    }
    updateClip(target.trackId, target.clip.id, { filter: filterId });
    addToast({
      type: 'success',
      title: 'Filter Applied',
      description: `Applied ${filterId} color grade to ${target.clip.name || 'clip'}.`,
    });
  };

  const applyFilterToAllClips = (filterId: string) => {
    if (!currentProject) return;
    const videoTracks = currentProject.tracks.filter((t) => t.type === 'video');
    let total = 0;
    videoTracks.forEach((vt) => {
      vt.clips.forEach((c) => {
        updateClip(vt.id, c.id, { filter: filterId });
        total++;
      });
    });
    addToast({
      type: 'success',
      title: 'Grade Applied to All Clips',
      description: `Applied ${filterId} color grade to all ${total} video clips.`,
    });
  };

  const applyTransitionToTarget = (transType: TransitionType, dur: number) => {
    const target = getTargetVideoClip();
    if (!target) {
      addToast({
        type: 'warning',
        title: 'No Video Clip Selected',
        description: 'Select a clip to apply a transition into the next clip.',
      });
      return;
    }
    updateClip(target.trackId, target.clip.id, { transition: { type: transType, duration: dur } });
    addToast({
      type: 'success',
      title: 'Transition Applied',
      description: `Applied ${transType} transition (${dur}s).`,
    });
  };

  const applyTransitionToAllCuts = (transType: TransitionType, dur: number) => {
    if (!currentProject) return;
    const videoTracks = currentProject.tracks.filter((t) => t.type === 'video');
    let total = 0;
    videoTracks.forEach((vt) => {
      vt.clips.forEach((c, idx) => {
        if (idx < vt.clips.length - 1) {
          updateClip(vt.id, c.id, { transition: { type: transType, duration: dur } });
          total++;
        }
      });
    });
    addToast({
      type: 'success',
      title: 'Transitions Applied to All Cuts',
      description: `Applied ${transType} (${dur}s) across all ${total} cuts.`,
    });
  };

  // Text Presets
  const TEXT_PRESETS = [
    { label: 'Title', desc: 'Cinematic bold heading', sample: 'TITLE HEADING', size: 48, weight: 'bold', color: '#ffffff', pos: 'center' },
    { label: 'Subtitle', desc: 'Secondary title or label', sample: 'Modern Subtitle', size: 32, weight: 'medium', color: '#e4e4e7', pos: 'center' },
    { label: 'Caption', desc: 'Clear dialogue caption', sample: 'Captions appear here cleanly', size: 24, weight: 'normal', color: '#f4f4f5', pos: 'bottom' },
    { label: 'Lower Third', desc: 'Speaker name & role overlay', sample: 'Jane Doe • Creative Director', size: 26, weight: 'semibold', color: '#ffffff', pos: 'bottom' },
    { label: 'Quote', desc: 'Stylized editorial quote', sample: '"Creativity is intelligence having fun."', size: 30, weight: 'normal', color: '#d4d4d8', pos: 'center' },
  ];

  // Visual Effects
  const EFFECTS_LIST = [
    { id: 'filmgrain', label: 'Film Grain', category: 'retro', intensity: 50, desc: '35mm organic luma grain', previewBg: 'radial-gradient(circle, #3f3f46 10%, #18181b 90%)' },
    { id: 'vignette', label: 'Vignette', category: 'cinematic', intensity: 50, desc: 'Optical corner darkening', previewBg: 'radial-gradient(circle, #71717a 20%, #09090b 85%)' },
    { id: 'blur', label: 'Gaussian Blur', category: 'basic', intensity: 40, desc: 'Optical depth defocus', previewBg: 'linear-gradient(135deg, #52525b 0%, #27272a 100%)' },
    { id: 'bloom', label: 'Bloom Glow', category: 'light', intensity: 50, desc: 'Soft diffused highlights', previewBg: 'radial-gradient(circle, #f4f4f5 10%, #27272a 80%)' },
    { id: 'vhs', label: 'VHS Tape', category: 'vhs', intensity: 50, desc: 'Retro scanlines & noise', previewBg: 'repeating-linear-gradient(0deg, #18181b, #18181b 2px, #27272a 2px, #27272a 4px)' },
    { id: 'glitch', label: 'Glitch Slice', category: 'glitch', intensity: 60, desc: 'Digital displacement slice', previewBg: 'linear-gradient(90deg, #27272a 30%, #52525b 50%, #18181b 70%)' },
    { id: 'letterbox', label: 'Cinemascope', category: 'cinematic', intensity: 100, desc: '2.35:1 widescreen matte', previewBg: 'linear-gradient(180deg, #000 20%, #3f3f46 20%, #3f3f46 80%, #000 80%)' },
    { id: 'shake', label: 'Camera Shake', category: 'motion', intensity: 35, desc: 'Handheld organic shake', previewBg: 'linear-gradient(45deg, #27272a 25%, #3f3f46 50%, #27272a 75%)' },
    { id: 'rgbsplit', label: 'RGB Split', category: 'glitch', intensity: 40, desc: 'Chromatic color separation', previewBg: 'linear-gradient(135deg, #3f3f46 0%, #18181b 100%)' },
  ];

  // 28 Genuinely Distinct Color LUT Filters across 6 Categories
  const FILTER_CATEGORIES = [
    { id: 'all', label: 'All (28)' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'bw', label: 'B&W' },
    { id: 'travel', label: 'Travel' },
    { id: 'neon', label: 'Neon' },
    { id: 'clean', label: 'Clean' },
  ];

  const FILTER_LIST = [
    { id: 'none', label: 'Original Neutral', category: 'all', previewGradient: 'from-zinc-700 via-zinc-600 to-zinc-800' },
    // Category 1: Cinematic
    { id: 'cinematic', label: 'Cinematic Gold', category: 'cinematic', previewGradient: 'from-amber-600 via-stone-700 to-cyan-900' },
    { id: 'film', label: 'Film 35mm', category: 'cinematic', previewGradient: 'from-amber-700 via-stone-800 to-zinc-900' },
    { id: 'moody', label: 'Moody Shadow', category: 'cinematic', previewGradient: 'from-zinc-800 via-slate-800 to-black' },
    { id: 'dramatic', label: 'Dramatic Crush', category: 'cinematic', previewGradient: 'from-slate-700 via-zinc-900 to-black' },
    { id: 'teal_orange', label: 'Teal & Orange', category: 'cinematic', previewGradient: 'from-cyan-600 via-stone-700 to-amber-600' },
    { id: 'warm_film', label: 'Warm Film', category: 'cinematic', previewGradient: 'from-amber-600 via-orange-800 to-stone-900' },
    { id: 'cold_film', label: 'Cold Film', category: 'cinematic', previewGradient: 'from-sky-700 via-slate-800 to-zinc-900' },
    // Category 2: Vintage
    { id: 'vintage', label: 'Vintage 70s', category: 'vintage', previewGradient: 'from-amber-700 via-yellow-900 to-zinc-900' },
    { id: 'retro', label: 'Retro Warm', category: 'vintage', previewGradient: 'from-orange-700 via-amber-800 to-stone-900' },
    { id: 'vhs', label: 'VHS Tape', category: 'vintage', previewGradient: 'from-purple-900 via-zinc-800 to-emerald-900' },
    { id: 'faded', label: 'Faded Matte', category: 'vintage', previewGradient: 'from-stone-500 via-zinc-600 to-zinc-700' },
    { id: 'old_film', label: 'Old Film', category: 'vintage', previewGradient: 'from-yellow-800 via-stone-700 to-zinc-900' },
    { id: 'sepia', label: 'Sepia Tone', category: 'vintage', previewGradient: 'from-amber-600 via-yellow-800 to-stone-900' },
    // Category 3: Black & White
    { id: 'noir', label: 'Film Noir', category: 'bw', previewGradient: 'from-zinc-300 via-zinc-600 to-black' },
    { id: 'mono', label: 'Neutral Mono', category: 'bw', previewGradient: 'from-zinc-400 via-zinc-700 to-zinc-900' },
    { id: 'high_contrast_bw', label: 'High Contrast B&W', category: 'bw', previewGradient: 'from-white via-zinc-700 to-black' },
    { id: 'soft_bw', label: 'Soft B&W', category: 'bw', previewGradient: 'from-zinc-300 via-zinc-500 to-zinc-800' },
    // Category 4: Travel
    { id: 'travel', label: 'Scenic Travel', category: 'travel', previewGradient: 'from-blue-600 via-emerald-600 to-stone-900' },
    { id: 'golden', label: 'Golden Hour', category: 'travel', previewGradient: 'from-amber-400 via-orange-600 to-yellow-800' },
    { id: 'tropical', label: 'Tropical Island', category: 'travel', previewGradient: 'from-emerald-400 via-teal-600 to-blue-700' },
    { id: 'sunset', label: 'Pacific Sunset', category: 'travel', previewGradient: 'from-orange-500 via-purple-700 to-zinc-900' },
    // Category 5: Urban / Neon
    { id: 'cyberpunk', label: 'Cyberpunk Neon', category: 'neon', previewGradient: 'from-fuchsia-600 via-purple-800 to-cyan-800' },
    { id: 'neon', label: 'Electric Neon', category: 'neon', previewGradient: 'from-pink-500 via-violet-700 to-blue-600' },
    { id: 'tokyo_night', label: 'Tokyo Night', category: 'neon', previewGradient: 'from-indigo-600 via-fuchsia-800 to-zinc-900' },
    { id: 'matrix_green', label: 'Matrix Terminal', category: 'neon', previewGradient: 'from-emerald-500 via-green-800 to-black' },
    // Category 6: Clean / Commercial
    { id: 'clean_pop', label: 'Clean Pop', category: 'clean', previewGradient: 'from-rose-500 via-amber-400 to-sky-500' },
    { id: 'pastel', label: 'Pastel Dream', category: 'clean', previewGradient: 'from-rose-300 via-teal-200 to-zinc-800' },
    { id: 'commercial', label: 'Clean Commercial', category: 'clean', previewGradient: 'from-sky-500 via-slate-600 to-zinc-800' },
    { id: 'bright_airy', label: 'Bright & Airy', category: 'clean', previewGradient: 'from-sky-200 via-amber-100 to-white' },
  ];

  // Visual Transitions
  const TRANSITION_LIST: Array<{ id: TransitionType; label: string; desc: string }> = [
    { id: 'dissolve', label: 'Dissolve', desc: 'Smooth optical blend' },
    { id: 'fade', label: 'Fade to Black', desc: 'Cinematic darkness dip' },
    { id: 'slideleft', label: 'Slide Left', desc: 'Clean horizontal push' },
    { id: 'slideright', label: 'Slide Right', desc: 'Smooth push to right' },
    { id: 'zoomin', label: 'Zoom In', desc: 'Impactful punch scale' },
    { id: 'zoomout', label: 'Zoom Out', desc: 'Cinematic pull back' },
    { id: 'wipeleft', label: 'Wipe Left', desc: 'Linear geometric wipe' },
    { id: 'cinematic', label: 'Cinematic Dip', desc: 'Exposure hold & fade' },
    { id: 'glitch', label: 'Glitch Cut', desc: 'Digital displacement slice' },
  ];

  const filteredMedia = mediaLibrary.filter((item) => {
    if (mediaFilter !== 'all' && item.type !== mediaFilter) return false;
    if (mediaSearch && !item.name.toLowerCase().includes(mediaSearch.toLowerCase())) return false;
    return true;
  });

  const executeBackgroundRemoval = async () => {
    const chosenMedia =
      mediaLibrary.find((m) => m.id === bgRemovalSelectedMediaId) ||
      (targetClip?.mediaId ? mediaLibrary.find((m) => m.id === targetClip.mediaId) : null) ||
      mediaLibrary.find((m) => m.type === 'image') ||
      mediaLibrary.find((m) => m.type === 'video');

    if (!chosenMedia) {
      addToast({
        type: 'warning',
        title: 'No Media Selected',
        description: 'Please upload or select an image or video to isolate subject.',
      });
      return;
    }

    setIsRemovingBg(true);
    setBgRemovalResult(null);

    try {
      const res = await fetch('/api/ai/background-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: chosenMedia.id,
          mode: bgRemovalMode,
          color: bgRemovalColor,
          bgImagePath: bgRemovalCustomImage || undefined,
          feather: bgRemovalFeather,
          iterations: bgRemovalIterations,
          scale: bgRemovalScale,
          posX: bgRemovalPosX,
          posY: bgRemovalPosY,
          bgOpacity: bgRemovalBgOpacity,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const item = data.data;
        const normalized = {
          ...item,
          url: item.url || item.mediaItem?.url || item.outputFile,
          thumbnailUrl: item.thumbnailUrl || item.mediaItem?.thumbnailUrl || item.url,
          engine: item.engine || item.method || 'rembg Neural AI (u2netp)',
          mediaId: item.mediaId || item.mediaItem?.id,
          isVideo: item.isVideo || false,
        };
        setBgRemovalResult(normalized);
        await fetchMedia();
        addToast({
          type: 'success',
          title: 'Background Processed',
          description: `Isolated subject using ${normalized.engine}.`,
        });
      } else {
        throw new Error(data.error || 'Background removal processing failed');
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Processing Error',
        description: err.message || 'Background removal error',
      });
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleResetCutout = () => {
    setBgRemovalResult(null);
    setBgRemovalScale(1.0);
    setBgRemovalPosX(0);
    setBgRemovalPosY(0);
    setBgRemovalBgOpacity(1.0);
    setBgRemovalFeather(5);
    setBgRemovalColor('#00ff00');
    setBgRemovalMode('transparent');
  };

  const handleAddCutoutToTimeline = () => {
    if (!bgRemovalResult) return;
    const isVid = bgRemovalResult.isVideo || false;
    const cutoutItem: MediaItem = {
      id: bgRemovalResult.mediaId || `cutout-${Date.now()}`,
      name: `Cutout (${bgRemovalResult.mode || 'ai'})`,
      originalName: `Cutout-${bgRemovalResult.mode || 'ai'}.${isVid ? 'mp4' : 'png'}`,
      filePath: bgRemovalResult.filePath || '',
      url: bgRemovalResult.url || '',
      thumbnailUrl: bgRemovalResult.thumbnailUrl || bgRemovalResult.url || '',
      type: isVid ? 'video' : 'image',
      size: bgRemovalResult.fileSize || 0,
      duration: isVid ? (bgRemovalResult.mediaItem?.duration || 5) : 5,
      width: bgRemovalResult.width || 1920,
      height: bgRemovalResult.height || 1080,
      fps: 30,
      mimeType: isVid ? 'video/mp4' : 'image/png',
      aspectRatio: (bgRemovalResult.width || 1920) > (bgRemovalResult.height || 1080) ? '16:9' : '9:16',
      createdAt: new Date().toISOString(),
    };
    addMediaToTimeline(cutoutItem);
    addToast({
      type: 'success',
      title: 'Overlay Layer Added',
      description: `${isVid ? 'Video' : 'Image'} cutout added to timeline overlay track.`,
    });
  };

  const TOOL_ACTIVE_COLORS: Partial<Record<ToolId, string>> = {
    media: 'bg-blue-950/70 text-blue-200 border border-blue-700/50',
    video: 'bg-blue-950/70 text-blue-200 border border-blue-700/50',
    photo: 'bg-pink-950/70 text-pink-200 border border-pink-700/50',
    audio: 'bg-cyan-950/70 text-cyan-200 border border-cyan-700/50',
    text: 'bg-zinc-800/90 text-white border border-zinc-700/60',
    captions: 'bg-zinc-800/90 text-white border border-zinc-700/60',
    transitions: 'bg-pink-950/70 text-pink-200 border border-pink-700/50',
    effects: 'bg-pink-950/70 text-pink-200 border border-pink-700/50',
    filters: 'bg-amber-950/70 text-amber-200 border border-amber-700/50',
    stickers: 'bg-pink-950/70 text-pink-200 border border-pink-700/50',
    adjust: 'bg-amber-950/70 text-amber-200 border border-amber-700/50',
    bg_removal: 'bg-teal-950/70 text-teal-200 border border-teal-700/50',
    background: 'bg-teal-950/70 text-teal-200 border border-teal-700/50',
    speed: 'bg-orange-950/70 text-orange-200 border border-orange-700/50',
    canvas: 'bg-zinc-800/90 text-white border border-zinc-700/60',
    ai_tools: 'bg-violet-950/70 text-violet-200 border border-violet-700/50',
    settings: 'bg-violet-950/70 text-violet-200 border border-violet-700/50',
  };

  // Mobile tool color map for bottom tray
  const MOBILE_TOOL_COLORS: Partial<Record<ToolId, { icon: string; activeBg: string; defaultBg: string }>> = {
    media:       { icon: 'text-zinc-200',   activeBg: 'bg-zinc-700/80',    defaultBg: 'bg-zinc-800/50' },
    video:       { icon: 'text-blue-300',   activeBg: 'bg-blue-900/70',    defaultBg: 'bg-blue-950/40' },
    photo:       { icon: 'text-pink-300',   activeBg: 'bg-pink-900/70',    defaultBg: 'bg-pink-950/40' },
    audio:       { icon: 'text-cyan-300',   activeBg: 'bg-cyan-900/70',    defaultBg: 'bg-cyan-950/40' },
    text:        { icon: 'text-zinc-200',   activeBg: 'bg-zinc-700/80',    defaultBg: 'bg-zinc-800/50' },
    captions:    { icon: 'text-zinc-200',   activeBg: 'bg-zinc-700/80',    defaultBg: 'bg-zinc-800/50' },
    transitions: { icon: 'text-pink-300',   activeBg: 'bg-pink-900/70',    defaultBg: 'bg-pink-950/40' },
    effects:     { icon: 'text-pink-300',   activeBg: 'bg-pink-900/70',    defaultBg: 'bg-pink-950/40' },
    filters:     { icon: 'text-amber-300',  activeBg: 'bg-amber-900/70',   defaultBg: 'bg-amber-950/40' },
    stickers:    { icon: 'text-pink-300',   activeBg: 'bg-pink-900/70',    defaultBg: 'bg-pink-950/40' },
    adjust:      { icon: 'text-amber-300',  activeBg: 'bg-amber-900/70',   defaultBg: 'bg-amber-950/40' },
    bg_removal:  { icon: 'text-teal-300',   activeBg: 'bg-teal-900/70',    defaultBg: 'bg-teal-950/40' },
    background:  { icon: 'text-teal-300',   activeBg: 'bg-teal-900/70',    defaultBg: 'bg-teal-950/40' },
    speed:       { icon: 'text-orange-300', activeBg: 'bg-orange-900/70',  defaultBg: 'bg-orange-950/40' },
    canvas:      { icon: 'text-zinc-200',   activeBg: 'bg-zinc-700/80',    defaultBg: 'bg-zinc-800/50' },
    ai_tools:    { icon: 'text-violet-300', activeBg: 'bg-violet-900/70',  defaultBg: 'bg-violet-950/40' },
    settings:    { icon: 'text-zinc-200',   activeBg: 'bg-zinc-700/80',    defaultBg: 'bg-zinc-800/50' },
  };

  return (
    <div className="flex h-full select-none z-20">
      {/* ======================================================
          DESKTOP LEFT TOOL RAIL — hidden on mobile (md:flex)
          ====================================================== */}
      <div className="hidden md:flex w-16 bg-[#111114] border-r border-zinc-800 flex-col items-center py-2 shrink-0 z-30 overflow-y-auto no-scrollbar justify-between">
        <div className="flex flex-col gap-1 w-full px-1.5">
          {TOOLS.filter((t) => t.id !== 'settings').map((tool) => {
            const Icon = tool.icon;
            const isMediaFilterVideo = tool.id === 'video' && activeTab === 'media' && mediaFilter === 'video';
            const isMediaFilterPhoto = tool.id === 'photo' && activeTab === 'media' && mediaFilter === 'image';
            const isMediaFilterAll = tool.id === 'media' && activeTab === 'media' && mediaFilter === 'all';
            const isActive =
              (isMediaFilterVideo || isMediaFilterPhoto || isMediaFilterAll ||
                (activeTab === tool.id && tool.id !== 'media' && tool.id !== 'video' && tool.id !== 'photo')) &&
              isDrawerOpen;
            return (
              <button
                key={tool.id}
                onClick={() => handleTabClick(tool.id)}
                className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? `${TOOL_ACTIVE_COLORS[tool.id] || 'bg-zinc-800/90 text-white border border-zinc-700/60'} font-semibold shadow-sm`
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
                title={tool.label}
              >
                <Icon className={`w-4 h-4 mb-1 transition-transform group-hover:scale-110 ${isActive ? '' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{tool.label}</span>
              </button>
            );
          })}
        </div>
        <div className="w-full px-1.5 pt-2 border-t border-zinc-800/60">
          {TOOLS.filter((t) => t.id === 'settings').map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === 'settings' && isDrawerOpen;
            return (
              <button
                key={tool.id}
                onClick={() => handleTabClick('settings')}
                className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-violet-950/70 text-violet-200 border border-violet-700/50 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
                title="Settings & Shortcuts"
              >
                <Icon className={`w-4 h-4 mb-1 transition-transform group-hover:scale-110 ${isActive ? 'text-violet-300' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">Settings</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          MOBILE BOTTOM TOOL TRAY — visible only on mobile
          Fixed at bottom, horizontally scrollable, color-coded
          ====================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[50] flex flex-col bg-[#0b0b10]/98 backdrop-blur-2xl border-t border-zinc-800/80 shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        {/* Scrollable tool chip row */}
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar touch-pan-x">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isMediaFilterVideo = tool.id === 'video' && activeTab === 'media' && mediaFilter === 'video';
            const isMediaFilterPhoto = tool.id === 'photo' && activeTab === 'media' && mediaFilter === 'image';
            const isMediaFilterAll   = tool.id === 'media' && activeTab === 'media' && mediaFilter === 'all';
            const isActive =
              (isMediaFilterVideo || isMediaFilterPhoto || isMediaFilterAll ||
                (activeTab === tool.id && tool.id !== 'media' && tool.id !== 'video' && tool.id !== 'photo')) &&
              isDrawerOpen;

            const c = MOBILE_TOOL_COLORS[tool.id] || { icon: 'text-zinc-300', activeBg: 'bg-zinc-700/80', defaultBg: 'bg-zinc-800/50' };

            return (
              <button
                key={tool.id}
                onClick={() => handleTabClick(tool.id)}
                className={`flex flex-col items-center justify-center min-w-[56px] h-[54px] rounded-2xl transition-all shrink-0 gap-1 px-1.5 border active:scale-95 ${
                  isActive
                    ? `${c.activeBg} border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)]`
                    : `${c.defaultBg} border-transparent hover:border-white/10`
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? c.icon : 'text-zinc-400'} transition-colors`} />
                <span className={`text-[9.5px] font-semibold truncate max-w-[52px] leading-none ${isActive ? 'text-white font-bold' : 'text-zinc-400'}`}>
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          DRAWER PANEL — Desktop left drawer, Mobile bottom sheet
          ====================================================== */}
      {isDrawerOpen && (
        <div className="fixed md:static inset-x-0 bottom-[64px] md:bottom-auto z-[60] md:z-20 w-full md:w-80 max-h-[60vh] md:max-h-full h-[55vh] md:h-full bg-[#101017]/98 md:bg-[#141418] border-t md:border-t-0 md:border-r border-zinc-700/80 md:border-zinc-800 rounded-t-3xl md:rounded-none flex flex-col shrink-0 shadow-[0_-15px_40px_rgba(0,0,0,0.85)] md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-left duration-200">
          {/* Drawer Header */}
          <div className="h-12 px-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-[#14141d]">
            <div className="flex items-center gap-2">
              <div className="md:hidden w-8 h-1 rounded-full bg-zinc-600 mr-1.5" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {TOOLS.find((t) => t.id === activeTab)?.label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">
                {targetClip ? targetClip.name : 'All Clips'}
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close Panel"
            >
              <ChevronLeft className="w-4 h-4 md:rotate-0 -rotate-90" />
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-4">
            {/* ================= PANEL 1: MEDIA ================= */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingMedia(true);
                  }}
                  onDragLeave={() => setIsDraggingMedia(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingMedia(false);
                    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
                  }}
                  onClick={() => mediaFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDraggingMedia
                      ? 'border-zinc-300 bg-zinc-800/60'
                      : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/40'
                  }`}
                >
                  <input
                    ref={mediaFileInputRef}
                    type="file"
                    multiple
                    accept="video/*,audio/*,image/*"
                    onChange={(e) => {
                      if (e.target.files) uploadFiles(e.target.files);
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-zinc-200">Import Video & Audio</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Drag & drop or click to browse</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    {(['all', 'video', 'audio'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setMediaFilter(filter)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                          mediaFilter === filter
                            ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                            : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter === 'video' ? 'Videos' : 'Audio'}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search recent media..."
                      value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                    <span>Recent Media</span>
                    <span>{filteredMedia.length} items</span>
                  </div>

                  {filteredMedia.length === 0 ? (
                    <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/80 text-center">
                      <FileVideo className="w-6 h-6 text-zinc-600 mx-auto mb-1.5" />
                      <p className="text-xs text-zinc-400">No media found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredMedia.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify(item));
                          }}
                          className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-12 h-10 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                              {item.thumbnailUrl ? (
                                <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : item.type === 'audio' ? (
                                <Music className="w-4 h-4 text-zinc-400" />
                              ) : (
                                <FileVideo className="w-4 h-4 text-zinc-400" />
                              )}
                              {item.duration > 0 && (
                                <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono px-1 py-0.2 rounded bg-black/80 text-zinc-300">
                                  {formatDuration(item.duration)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 uppercase font-mono">
                                {item.type} • {item.name.split('.').pop() || 'mp4'}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => addMediaToTimeline(item)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0 ml-2"
                            title="Add to Timeline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= PANEL 2: AUDIO ================= */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
                  <Sliders className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                  <span>
                    10 Genuine BGM compositions with distinct BPM and waveforms. Volume and fades apply to preview and export.
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={audioSearch}
                    onChange={handleAudioSearchChange}
                    placeholder="Search music tracks, BPM, mood..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['all', 'cinematic', 'vlog', 'travel', 'energetic', 'chill', 'emotional', 'fashion', 'documentary', 'happy', 'dramatic'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleAudioCategoryChange(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                          : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All Tracks (10)' : cat}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {audioLibrary.map((item) => {
                    const isPlaying = playingAudioId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleAudioPlay(item)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              isPlaying
                                ? 'bg-zinc-100 text-zinc-950 font-bold'
                                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                            }`}
                            title={isPlaying ? 'Pause' : 'Audition Track'}
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-zinc-950" />
                            ) : (
                              <Play className="w-3.5 h-3.5 ml-0.5 text-zinc-200" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate max-w-[130px]">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                              <span className="font-mono text-zinc-300">{item.bpm || 120} BPM</span>
                              <span>•</span>
                              <span>{formatDuration(item.duration)}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            addAudioToTimeline(item);
                            fetchAudioBeats(item.duration, item.bpm || 120);
                            addToast({
                              type: 'success',
                              title: 'Audio Added',
                              description: `Added "${item.name}" to audio track.`,
                            });
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-200 hover:text-white border border-zinc-700 flex items-center gap-1 transition-colors"
                          title="Add to Audio Track"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= PANEL 3: TEXT ================= */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Text Overlays</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Rendered directly via FFmpeg drawtext in exports.</p>
                </div>

                <div className="space-y-3">
                  {TEXT_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        addTextToTimeline(preset.sample, {
                          fontSize: preset.size,
                          color: preset.color,
                          fontWeight: preset.weight,
                          position: preset.pos,
                        });
                        addToast({
                          type: 'success',
                          title: 'Text Added',
                          description: `Added ${preset.label} to text track.`,
                        });
                      }}
                      className="p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-600 cursor-pointer group transition-all"
                    >
                      <div className="h-12 rounded-xl bg-black border border-zinc-800 flex items-center justify-center p-2 mb-2 overflow-hidden">
                        <span
                          style={{
                            fontSize: `${Math.min(20, preset.size * 0.45)}px`,
                            fontWeight: preset.weight,
                            color: preset.color,
                          }}
                          className="truncate max-w-full text-center"
                        >
                          {preset.sample}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-zinc-200">{preset.label}</div>
                          <div className="text-[10px] text-zinc-400">{preset.desc}</div>
                        </div>
                        <button className="p-1.5 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= PANEL 4: STICKERS ================= */}
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Callouts & Badges</h4>
                  <p className="text-[11px] text-zinc-400">Click to place on the sticker timeline.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['SUBSCRIBE', 'LIKE & SHARE', 'FOLLOW', 'NEW', 'LIVE 🔴', 'HOT 🔥'].map((badge) => (
                    <button
                      key={badge}
                      onClick={() => {
                        addStickerToTimeline({ type: 'badge', category: 'social', content: badge });
                        addToast({ type: 'success', title: 'Badge Placed', description: badge });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-bold text-white hover:bg-zinc-850 transition-all text-center truncate"
                    >
                      {badge}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <h4 className="text-xs font-bold text-white mb-2">Reactions</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['🔥', '🚀', '✨', '💯', '⚡', '🎬', '❤️', '👏'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          addStickerToTimeline({ type: 'emoji', category: 'reaction', content: emoji });
                          addToast({ type: 'success', title: 'Reaction Added', description: emoji });
                        }}
                        className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xl flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= PANEL 5: EFFECTS ================= */}
            {activeTab === 'effects' && (
              <div className="space-y-4">
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['all', 'basic', 'cinematic', 'retro', 'glitch', 'vhs', 'light', 'motion'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEffectCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize whitespace-nowrap transition-all ${
                        effectCategory === cat
                          ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                          : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {EFFECTS_LIST.filter(
                    (e) => effectCategory === 'all' || e.category === effectCategory
                  ).map((effect) => {
                    const isApplied = activeClipEffects.some((e) => e.type === effect.id && e.enabled !== false);

                    return (
                      <div
                        key={effect.id}
                        className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isApplied
                            ? 'bg-zinc-850 border-zinc-400 shadow-sm'
                            : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          style={{ background: effect.previewBg }}
                          className="h-12 rounded-xl border border-zinc-800 flex items-center justify-center mb-2 overflow-hidden relative"
                        >
                          <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {effect.label}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white truncate">{effect.label}</div>
                          <div className="text-[9px] text-zinc-400 truncate mb-2">{effect.desc}</div>
                        </div>

                        <div className="flex items-center gap-1 mt-auto">
                          <button
                            onClick={() => applyEffectToTarget(effect.id, effect.intensity)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isApplied
                                ? 'bg-zinc-200 text-zinc-950 hover:bg-white'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            {isApplied ? 'Applied' : '+ Add'}
                          </button>
                          <button
                            onClick={() => applyEffectToAllClips(effect.id, effect.intensity)}
                            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                            title="Apply to All Clips"
                          >
                            <Zap className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= PANEL 6: FILTERS (28 Genuinely Distinct LUTs) ================= */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Color LUT Presets (28)</h4>
                    <p className="text-[10px] text-zinc-400">Authentic FFmpeg color matrix grading</p>
                  </div>
                  <button
                    onClick={() => applyFilterToAllClips(activeClipFilter)}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-300 border border-zinc-700"
                    title="Apply current grade to all clips"
                  >
                    Apply to All
                  </button>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {FILTER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                        filterCategory === cat.id
                          ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                          : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {FILTER_LIST.filter(
                    (f) => filterCategory === 'all' || f.category === filterCategory || f.id === 'none'
                  ).map((filter) => {
                    const isActive = activeClipFilter === filter.id;

                    return (
                      <div
                        key={filter.id}
                        onClick={() => applyFilterToTarget(filter.id)}
                        className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                          isActive
                            ? 'bg-zinc-850 border-zinc-300 shadow-sm scale-[0.98]'
                            : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className={`h-12 rounded-xl bg-gradient-to-br ${filter.previewGradient} border border-zinc-800 flex items-center justify-center mb-1.5 overflow-hidden relative shadow-inner`}
                        >
                          {isActive && (
                            <div className="w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="text-xs font-bold text-white truncate">{filter.label}</div>
                        <div className="text-[9px] text-zinc-400 uppercase font-mono">
                          {isActive ? 'Active Grade' : 'Click to Apply'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= PANEL 7: ADJUST (Light, Color, Detail, Cinematic) ================= */}
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Pixel Adjustments</h4>
                    <p className="text-[10px] text-zinc-400">Live preview + FFmpeg rendering</p>
                  </div>
                  <button
                    onClick={resetAllAdjustments}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                    title="Reset All"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section A: Light */}
                <div className="space-y-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Light & Exposure</span>
                  </div>
                  {[
                    { key: 'exposure' as const, label: 'Exposure', min: -100, max: 100 },
                    { key: 'brightness' as const, label: 'Brightness', min: -100, max: 100 },
                    { key: 'contrast' as const, label: 'Contrast', min: -100, max: 100 },
                    { key: 'highlights' as const, label: 'Highlights', min: -100, max: 100 },
                    { key: 'shadows' as const, label: 'Shadows', min: -100, max: 100 },
                    { key: 'whites' as const, label: 'Whites', min: -100, max: 100 },
                    { key: 'blacks' as const, label: 'Blacks', min: -100, max: 100 },
                  ].map(({ key, label, min, max }) => {
                    const val = currentAdjustments[key] || 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-zinc-400">
                          <span>{label}</span>
                          <span className="font-mono text-zinc-200">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => handleAdjustmentChange(key, parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Section B: Color */}
                <div className="space-y-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Color Tone</span>
                  </div>
                  {[
                    { key: 'temperature' as const, label: 'Temperature', min: -100, max: 100 },
                    { key: 'tint' as const, label: 'Tint', min: -100, max: 100 },
                    { key: 'saturation' as const, label: 'Saturation', min: -100, max: 100 },
                    { key: 'vibrance' as const, label: 'Vibrance', min: -100, max: 100 },
                    { key: 'hue' as const, label: 'Hue Rotate', min: -180, max: 180 },
                  ].map(({ key, label, min, max }) => {
                    const val = currentAdjustments[key] || 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-zinc-400">
                          <span>{label}</span>
                          <span className="font-mono text-zinc-200">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => handleAdjustmentChange(key, parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Section C: Detail & Optics */}
                <div className="space-y-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Contrast className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Detail & Optics</span>
                  </div>
                  {[
                    { key: 'sharpness' as const, label: 'Sharpness', min: 0, max: 100 },
                    { key: 'clarity' as const, label: 'Clarity', min: 0, max: 100 },
                    { key: 'grain' as const, label: 'Film Grain', min: 0, max: 100 },
                    { key: 'vignette' as const, label: 'Vignette', min: 0, max: 100 },
                    { key: 'fade' as const, label: 'Fade Lift', min: 0, max: 100 },
                    { key: 'blur' as const, label: 'Lens Blur', min: 0, max: 100 },
                  ].map(({ key, label, min, max }) => {
                    const val = currentAdjustments[key] || 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[10px] mb-1 font-semibold text-zinc-400">
                          <span>{label}</span>
                          <span className="font-mono text-zinc-200">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => handleAdjustmentChange(key, parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= PANEL 8: TRANSITIONS ================= */}
            {activeTab === 'transitions' && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Transition Duration</span>
                    <span className="font-mono text-white font-bold">{transitionDuration.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.0}
                    step={0.1}
                    value={transitionDuration}
                    onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                  />
                </div>

                <div className="space-y-2.5">
                  {TRANSITION_LIST.map((trans) => (
                    <div
                      key={trans.id}
                      className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1 text-[8px] font-mono text-zinc-400 shrink-0">
                          <span className="w-2.5 h-4 bg-zinc-700 rounded-sm" />
                          <span className="text-zinc-200">➔</span>
                          <span className="w-2.5 h-4 bg-zinc-400 rounded-sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{trans.label}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{trans.desc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => applyTransitionToTarget(trans.id, transitionDuration)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-700 transition-colors"
                          title="Apply to Selected Cut"
                        >
                          Cut
                        </button>
                        <button
                          onClick={() => applyTransitionToAllCuts(trans.id, transitionDuration)}
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                          title="Apply to All Cuts"
                        >
                          <Zap className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= PANEL 9: SPEED (Chained Atempo 0.25x - 4x) ================= */}
            {activeTab === 'speed' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Playback Speed</h4>
                  <p className="text-[10px] text-zinc-400">Chained atempo filters preserve audio pitch cleanly.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Selected Clip Speed</span>
                    <span className="font-mono text-base font-bold text-white">
                      {(targetClip?.speed || 1).toFixed(2)}x
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map((spd) => {
                      const isCurrent = (targetClip?.speed || 1) === spd;
                      return (
                        <button
                          key={spd}
                          onClick={() => {
                            if (!targetVideo) return;
                            updateClip(targetVideo.trackId, targetVideo.clip.id, { speed: spd });
                            addToast({ type: 'success', title: 'Speed Set', description: `${spd}x speed applied.` });
                          }}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                            isCurrent
                              ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {spd}x
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="range"
                    min={0.25}
                    max={4.0}
                    step={0.05}
                    value={targetClip?.speed || 1}
                    onChange={(e) => {
                      if (!targetVideo) return;
                      updateClip(targetVideo.trackId, targetVideo.clip.id, {
                        speed: parseFloat(e.target.value),
                      });
                    }}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
                  />
                </div>
              </div>
            )}

            {/* ================= PANEL 10: CUTOUT & AI BACKGROUND REMOVAL ================= */}
            {(activeTab === 'bg_removal' || activeTab === 'background') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">AI Background Removal</h4>
                    <p className="text-[10px] text-zinc-400">Isolate subjects & composite backgrounds</p>
                  </div>
                  {/* Mode Tab Switch */}
                  <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-[10px]">
                    <button
                      onClick={() => setBgRemovalTab('ai_cutout')}
                      className={`px-2 py-0.5 rounded font-semibold transition-all ${
                        bgRemovalTab === 'ai_cutout' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      AI Cutout
                    </button>
                    <button
                      onClick={() => setBgRemovalTab('chroma_key')}
                      className={`px-2 py-0.5 rounded font-semibold transition-all ${
                        bgRemovalTab === 'chroma_key' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Chroma Key
                    </button>
                  </div>
                </div>

                {bgRemovalTab === 'ai_cutout' ? (
                  <div className="space-y-3">
                    {/* Live AI Engine Status Card */}
                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <div className="text-[11px] font-bold text-zinc-200">
                            {bgRemovalStatus?.engine || 'OpenCV GrabCut Engine'}
                          </div>
                          <div className="text-[9px] text-zinc-400">
                            {bgRemovalStatus?.message || 'High-precision subject edge segmentation'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                        ACTIVE
                      </span>
                    </div>

                    {/* Source Media Selection */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-zinc-400">Target Media Source</label>
                        {targetClip && <span className="text-[9px] text-cyan-400 font-mono">Clip Selected</span>}
                      </div>

                      {/* Dropdown / Selection of Library Assets */}
                      <div className="flex items-center gap-2">
                        <select
                          value={bgRemovalSelectedMediaId || targetClip?.mediaId || ''}
                          onChange={(e) => setBgRemovalSelectedMediaId(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="">-- Select uploaded asset or use active clip --</option>
                          {mediaLibrary.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.type.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selected Preview Pill */}
                      <div className="flex items-center gap-2.5 pt-1">
                        {targetClip?.thumbnailUrl || targetClip?.url ? (
                          <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-700 overflow-hidden shrink-0">
                            {targetClip.thumbnailUrl ? (
                              <img src={targetClip.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <video src={targetClip.url} className="w-full h-full object-cover" />
                            )}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-850 border border-zinc-700 flex items-center justify-center text-zinc-500 shrink-0">
                            <Image className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-zinc-200 truncate">
                            {targetClip ? targetClip.name : (mediaLibrary.find(m => m.id === bgRemovalSelectedMediaId)?.name || 'Using library media asset')}
                          </div>
                          <div className="text-[9px] text-zinc-400">
                            {targetClip ? `${formatDuration(targetClip.duration)} • Active timeline clip` : `${mediaLibrary.length} assets ready in library`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mode Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-400 block">Replacement Mode</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'transparent', label: 'Transparent Alpha', desc: 'Clean cutout layer (PNG)' },
                          { id: 'color', label: 'Studio Solid Color', desc: 'Custom backdrop color' },
                          { id: 'blur', label: 'Bokeh Background', desc: 'Gaussian blurred depth' },
                          { id: 'custom_image', label: 'Image Backdrop', desc: 'Replace with custom image' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setBgRemovalMode(m.id as any)}
                            className={`p-2 rounded-xl text-left border transition-all ${
                              bgRemovalMode === m.id
                                ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                                : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                            }`}
                          >
                            <div className="text-[11px] font-bold">{m.label}</div>
                            <div className="text-[9px] text-zinc-500">{m.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Presets (When mode === 'color') */}
                    {bgRemovalMode === 'color' && (
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                        <label className="text-[10px] font-semibold text-zinc-400 block">Backdrop Color</label>
                        <div className="flex items-center gap-2">
                          {[
                            { name: 'Chroma Green', color: '#00ff00' },
                            { name: 'Obsidian Black', color: '#0a0a0a' },
                            { name: 'Studio White', color: '#ffffff' },
                            { name: 'Electric Cyan', color: '#0891b2' },
                            { name: 'Deep Violet', color: '#581c87' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              onClick={() => setBgRemovalColor(c.color)}
                              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                                bgRemovalColor === c.color ? 'scale-125 border-cyan-400' : 'border-zinc-700'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.name}
                            />
                          ))}
                          <input
                            type="color"
                            value={bgRemovalColor}
                            onChange={(e) => setBgRemovalColor(e.target.value)}
                            className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-none ml-auto"
                            title="Custom Color"
                          />
                        </div>
                      </div>
                    )}

                    {/* Edge Feathering & Refinement Controls */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-400">Edge Feather / Softness</span>
                          <span className="font-mono text-cyan-300">{bgRemovalFeather}px</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={25}
                          value={bgRemovalFeather}
                          onChange={(e) => setBgRemovalFeather(parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-400">Subject Scale</span>
                          <span className="font-mono text-cyan-300">{(bgRemovalScale * 100).toFixed(0)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={1.8}
                          step={0.05}
                          value={bgRemovalScale}
                          onChange={(e) => setBgRemovalScale(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-zinc-400">Offset X</span>
                            <span className="font-mono text-zinc-300">{bgRemovalPosX}px</span>
                          </div>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            value={bgRemovalPosX}
                            onChange={(e) => setBgRemovalPosX(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-zinc-400">Offset Y</span>
                            <span className="font-mono text-zinc-300">{bgRemovalPosY}px</span>
                          </div>
                          <input
                            type="range"
                            min={-150}
                            max={150}
                            value={bgRemovalPosY}
                            onChange={(e) => setBgRemovalPosY(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-300"
                          />
                        </div>
                      </div>

                      {bgRemovalMode !== 'transparent' && (
                        <div className="space-y-1 pt-1 border-t border-zinc-800">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-zinc-400">Background Opacity</span>
                            <span className="font-mono text-cyan-300">{(bgRemovalBgOpacity * 100).toFixed(0)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={bgRemovalBgOpacity}
                            onChange={(e) => setBgRemovalBgOpacity(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>
                      )}
                    </div>

                    {/* Execute Action Button */}
                    <button
                      onClick={executeBackgroundRemoval}
                      disabled={isRemovingBg}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-white to-cyan-300 hover:from-cyan-300 hover:to-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(34,211,238,0.3)] disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isRemovingBg ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                          <span>Processing Neural Segmentation...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 text-zinc-950" />
                          <span>Isolate Subject Now (Neural AI)</span>
                        </>
                      )}
                    </button>

                    {/* Result Preview Card with Transparency Checkerboard */}
                    {bgRemovalResult && (
                      <div className="p-3 rounded-2xl bg-zinc-900/90 border border-cyan-500/40 space-y-2.5 animate-in fade-in shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            Cutout Ready
                          </span>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                            {bgRemovalResult.engine || 'rembg-u2netp'}
                          </span>
                        </div>

                        {/* Interactive Checkerboard Preview */}
                        <div
                          className="w-full h-36 rounded-xl overflow-hidden border border-zinc-700/80 relative flex items-center justify-center"
                          style={{
                            backgroundImage: 'repeating-conic-gradient(#26262b 0% 25%, #18181b 0% 50%)',
                            backgroundSize: '16px 16px',
                          }}
                        >
                          {bgRemovalResult.isVideo ? (
                            <video
                              src={bgRemovalResult.url}
                              controls
                              autoPlay
                              loop
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img
                              src={bgRemovalResult.url}
                              alt="Cutout Result"
                              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                            />
                          )}
                        </div>

                        {/* Dimensions & File details */}
                        <div className="flex items-center justify-between text-[9px] text-zinc-400 px-1 font-mono">
                          <span>{bgRemovalResult.width}x{bgRemovalResult.height}</span>
                          <span>{((bgRemovalResult.fileSize || 0) / 1024).toFixed(1)} KB</span>
                          <span className="text-cyan-400">{bgRemovalResult.mode.toUpperCase()}</span>
                        </div>

                        {/* Action Buttons: Apply, Add to Timeline, Reset */}
                        <div className="space-y-1.5 pt-1">
                          <button
                            onClick={handleAddCutoutToTimeline}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-xs font-bold text-white shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                            <span>Add as Overlay Track to Timeline</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {targetClip && (
                              <button
                                onClick={() => {
                                  if (!targetVideo) return;
                                  updateClip(targetVideo.trackId, targetVideo.clip.id, {
                                    url: bgRemovalResult.url,
                                    thumbnailUrl: bgRemovalResult.url,
                                  });
                                  addToast({
                                    type: 'success',
                                    title: 'Clip Updated',
                                    description: 'Replaced selected clip with cutout media.',
                                  });
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 border border-zinc-700 transition-colors"
                              >
                                Replace Clip
                              </button>
                            )}
                            <button
                              onClick={handleResetCutout}
                              className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-red-950/50 hover:text-red-300 text-[11px] font-semibold text-zinc-400 border border-zinc-800 hover:border-red-800/60 transition-colors ml-auto"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chroma Key Subtab (Existing Video Colorkeying) */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Green Screen Keying</div>
                          <div className="text-[10px] text-zinc-400">Remove solid background colors</div>
                        </div>
                        <button
                          onClick={() => {
                            if (!targetVideo) return;
                            const curr = !!targetClip?.removeBackground;
                            updateClip(targetVideo.trackId, targetVideo.clip.id, {
                              removeBackground: !curr,
                              bgKeyColor: targetClip?.bgKeyColor || '0x00FF00',
                            });
                            addToast({
                              type: 'success',
                              title: !curr ? 'Chroma Key Enabled' : 'Chroma Key Disabled',
                              description: !curr ? 'Keying out green/selected background.' : 'Restored full clip opacity.',
                            });
                          }}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                            targetClip?.removeBackground
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {targetClip?.removeBackground ? 'KEYING ON' : 'DISABLED'}
                        </button>
                      </div>

                      {targetClip?.removeBackground && (
                        <div className="space-y-2 pt-2 border-t border-zinc-800">
                          <label className="text-[10px] font-semibold text-zinc-400 block">Key Color Preset</label>
                          <div className="flex gap-2">
                            {[
                              { color: '0x00FF00', bg: 'bg-emerald-500', name: 'Green' },
                              { color: '0x0000FF', bg: 'bg-blue-600', name: 'Blue' },
                              { color: '0xFFFFFF', bg: 'bg-white', name: 'White' },
                              { color: '0x000000', bg: 'bg-black', name: 'Black' },
                            ].map((kc) => (
                              <button
                                key={kc.color}
                                onClick={() => {
                                  if (!targetVideo) return;
                                  updateClip(targetVideo.trackId, targetVideo.clip.id, { bgKeyColor: kc.color });
                                }}
                                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border flex items-center justify-center gap-1 ${
                                  targetClip?.bgKeyColor === kc.color ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-900'
                                }`}
                              >
                                <span className={`w-2.5 h-2.5 rounded-full ${kc.bg}`} />
                                <span>{kc.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= PANEL 11: CANVAS & ASPECT RATIO ================= */}
            {activeTab === 'canvas' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Canvas & Aspect Ratio</h4>
                  <p className="text-[10px] text-zinc-400">Dynamic scaling for social platforms</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { ratio: '16:9' as AspectRatio, label: '16:9 Landscape', desc: 'YouTube / Widescreen' },
                      { ratio: '9:16' as AspectRatio, label: '9:16 Vertical', desc: 'TikTok / Reels / Shorts' },
                      { ratio: '1:1' as AspectRatio, label: '1:1 Square', desc: 'Instagram Feed' },
                      { ratio: '4:5' as AspectRatio, label: '4:5 Portrait', desc: 'Social Portrait' },
                    ].map((asp) => (
                      <button
                        key={asp.ratio}
                        onClick={() => {
                          updateProject({ aspectRatio: asp.ratio });
                          setExportConfig({ aspectRatio: asp.ratio });
                          addToast({ type: 'success', title: 'Canvas Ratio', description: `Switched to ${asp.label}.` });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          (currentProject?.aspectRatio || '16:9') === asp.ratio
                            ? 'bg-zinc-800 text-white border-zinc-400 shadow-sm'
                            : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{asp.label}</div>
                        <div className="text-[9px] text-zinc-400">{asp.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Render Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['720p', '1080p', '4k'] as Resolution[]).map((res) => (
                      <button
                        key={res}
                        onClick={() => {
                          setExportConfig({ resolution: res });
                          addToast({ type: 'info', title: 'Resolution Set', description: res.toUpperCase() });
                        }}
                        className={`py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                          (exportConfig?.resolution || '1080p') === res
                            ? 'bg-zinc-100 text-zinc-950 border-white'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {res.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= PANEL 12: CAPTIONS ================= */}
            {activeTab === 'captions' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Auto Captions & Subtitles</h4>
                  <p className="text-[10px] text-zinc-400">Burned into exported video using libfreetype drawtext</p>
                </div>

                {/* Honest Speech-to-Text Status Card */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-zinc-200">
                      {speechStatus?.engine || 'Manual Timed Captions'}
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      speechStatus?.available
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {speechStatus?.available ? 'API ONLINE' : 'LOCAL ENGINE'}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-relaxed">
                    {speechStatus?.message || 'Manual timed subtitles and subtitle styles are fully operational without external API keys.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    addTextToTimeline('Auto-Generated Caption Here', {
                      fontSize: 28,
                      color: '#ffffff',
                      position: 'bottom',
                      fontWeight: 'semibold',
                    });
                    addToast({
                      type: 'success',
                      title: 'Captions Created',
                      description: 'Subtitle track added with high-contrast box overlay.',
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-200 text-zinc-950 hover:bg-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Subtitles className="w-4 h-4" />
                  <span>Add Timed Caption Line</span>
                </button>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="text-xs font-bold text-white">Quick Subtitle Presets</div>
                  <div className="space-y-2">
                    {[
                      { name: 'Viral Yellow Box', color: '#facc15', size: 32 },
                      { name: 'Clean White Crisp', color: '#ffffff', size: 28 },
                      { name: 'Neon Green Pop', color: '#4ade80', size: 30 },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          addTextToTimeline(preset.name, {
                            fontSize: preset.size,
                            color: preset.color,
                            position: 'bottom',
                          });
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-between"
                      >
                        <span>{preset.name}</span>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= PANEL 13: AI TOOLS ================= */}
            {activeTab === 'ai_tools' && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white">AI Studio Utilities</h4>
                  <p className="text-[10px] text-zinc-400">Automated audio enhancement & rhythm syncing</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-zinc-200" />
                    <div>
                      <div className="text-xs font-bold text-white">Auto Beat Sync</div>
                      <div className="text-[10px] text-zinc-400">Align cuts to BGM rhythm drops</div>
                    </div>
                  </div>
                  <button
                    onClick={() => autoSyncCutsToBeats()}
                    className="w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 hover:text-white border border-zinc-700 transition-colors"
                  >
                    Sync Timeline to Beats
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-zinc-200" />
                    <div>
                      <div className="text-xs font-bold text-white">Voice Dialogue Enhance</div>
                      <div className="text-[10px] text-zinc-400">Equalize 3kHz vocal presence</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!targetVideo) return;
                      const curr = !!targetClip?.voiceEnhance;
                      updateClip(targetVideo.trackId, targetVideo.clip.id, { voiceEnhance: !curr });
                      addToast({
                        type: 'success',
                        title: !curr ? 'Voice Enhance On' : 'Voice Enhance Off',
                        description: !curr ? 'Vocals equalized for clarity.' : 'Disabled.',
                      });
                    }}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      targetClip?.voiceEnhance
                        ? 'bg-zinc-100 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {targetClip?.voiceEnhance ? 'Voice Enhanced' : 'Enable Voice Enhance'}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-zinc-200" />
                    <div>
                      <div className="text-xs font-bold text-white">Noise Reduction (-25dB)</div>
                      <div className="text-[10px] text-zinc-400">FFmpeg afftdn background noise floor reduction</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!targetVideo) return;
                      const curr = !!targetClip?.noiseReduction;
                      updateClip(targetVideo.trackId, targetVideo.clip.id, { noiseReduction: !curr });
                      addToast({
                        type: 'success',
                        title: !curr ? 'Denoise Active' : 'Denoise Off',
                        description: !curr ? 'AFFTDN filter applied to audio stream.' : 'Disabled.',
                      });
                    }}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      targetClip?.noiseReduction
                        ? 'bg-zinc-100 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {targetClip?.noiseReduction ? 'Denoise Active (-25dB)' : 'Enable Denoise'}
                  </button>
                </div>
              </div>
            )}

            {/* ================= PANEL 14: SETTINGS ================= */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Editor Settings</h4>
                  <p className="text-[10px] text-zinc-400">Canvas defaults, snapping, and shortcuts</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="text-xs font-bold text-white">Project Canvas & Aspect</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { ratio: '16:9' as AspectRatio, label: '16:9 Landscape' },
                      { ratio: '9:16' as AspectRatio, label: '9:16 Vertical' },
                      { ratio: '1:1' as AspectRatio, label: '1:1 Square' },
                      { ratio: '4:5' as AspectRatio, label: '4:5 Portrait' },
                    ].map((asp) => (
                      <button
                        key={asp.ratio}
                        onClick={() => {
                          updateProject({ aspectRatio: asp.ratio });
                          setExportConfig({ aspectRatio: asp.ratio });
                          addToast({ type: 'info', title: 'Canvas Ratio', description: asp.label });
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                          (currentProject?.aspectRatio || '16:9') === asp.ratio
                            ? 'bg-zinc-800 text-white border-zinc-400'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {asp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                  <div className="text-xs font-bold text-white">Keyboard Shortcuts</div>
                  <div className="space-y-1.5 text-[11px] text-zinc-400">
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span>Play / Pause</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Space</kbd>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span>Split Clip at Playhead</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">S</kbd>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span>Delete Selected Clip</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Del / Backspace</kbd>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span>Undo / Redo</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Ctrl+Z / Ctrl+Y</kbd>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>Copy / Paste Clip</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Ctrl+C / Ctrl+V</kbd>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPanels;