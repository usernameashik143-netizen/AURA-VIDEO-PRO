export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type Resolution = '720p' | '1080p' | '1440p' | '4k';
export type FrameRate = 24 | 30 | 60;
export type VideoFormat = 'mp4' | 'webm';
export type ExportQuality = 'standard' | 'high' | 'maximum';

export type AppSection =
  | 'dashboard'
  | 'autoedit'
  | 'editor'
  | 'templates'
  | 'projects'
  | 'media'
  | 'export'
  | 'settings'
  | 'effects'
  | 'transitions'
  | 'audio'
  | 'ai_tools';

export interface MediaItem {
  id: string;
  name: string;
  originalName: string;
  type: 'video' | 'audio' | 'image';
  mimeType: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
  filePath: string;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
  aspectRatio: string;
}

export type TransitionType =
  | 'none'
  | 'cut'
  | 'fade'
  | 'dissolve'
  | 'crossfade'
  | 'slide'
  | 'slideleft'
  | 'slideright'
  | 'slideup'
  | 'slidedown'
  | 'push'
  | 'pushleft'
  | 'pushright'
  | 'pushup'
  | 'pushdown'
  | 'zoom'
  | 'zoomin'
  | 'zoomout'
  | 'softzoom'
  | 'blur'
  | 'wipe'
  | 'wipeleft'
  | 'wiperight'
  | 'wipeup'
  | 'wipedown'
  | 'smooth'
  | 'smoothleft'
  | 'smoothright'
  | 'cinematic'
  | 'filmdissolve'
  | 'light'
  | 'lens'
  | 'filmburn'
  | 'camerapush'
  | 'camerapull'
  | 'glitch'
  | 'rgbsplit'
  | 'flash'
  | 'shake'
  | 'spin'
  | 'whip'
  | 'motionblur'
  | 'digital'
  | 'pixelize';

export interface ClipTransition {
  type: TransitionType;
  duration: number; // in seconds, e.g. 0.6
}

export interface VideoAdjustment {
  // Light
  exposure?: number; // -100 to 100
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  highlights?: number; // -100 to 100
  shadows?: number; // -100 to 100
  whites?: number; // -100 to 100
  blacks?: number; // -100 to 100
  temperature?: number; // -100 to 100
  tint?: number; // -100 to 100
  // Color
  vibrance?: number; // -100 to 100
  hue?: number; // -180 to 180
  fade?: number; // 0 to 100
  // Detail
  sharpness?: number; // 0 to 100
  clarity?: number; // 0 to 100
  // Cinematic
  grain?: number; // 0 to 100
  vignette?: number; // 0 to 100
  blur?: number; // 0 to 100
}

export interface ClipEffect {
  id: string;
  type: string; // 'filmgrain' | 'vignette' | 'letterbox' | 'bloom' | 'lensflare' | 'vhs' | 'glitch' | 'rgbsplit' | 'shake' | 'zoomblur'
  intensity: number; // 0 to 100
  enabled?: boolean;
  blendMode?: string;
}

export interface ClipKeyframe {
  id: string;
  time: number; // relative seconds from clip start
  properties: {
    positionX?: number;
    positionY?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
    volume?: number;
  };
}

export interface StickerData {
  type: string; // 'emoji' | 'shape' | 'arrow' | 'social' | 'badge' | 'frame'
  category: string;
  content: string; // emoji char, SVG name, or text
  color?: string;
  animation?: 'none' | 'pop' | 'bounce' | 'pulse' | 'spin' | 'fade';
}

export interface AudioTrackItem {
  id: string;
  name: string;
  title?: string;
  category: string;
  duration: number;
  url: string;
  artist?: string;
  license?: string;
  bpm?: number;
  peaks?: number[];
  waveform?: number[];
}

export interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom' | 'custom';
  posX?: number; // 0 to 100%
  posY?: number; // 0 to 100%
  animation?: 'none' | 'fade' | 'pop' | 'slide' | 'bounce' | 'karaoke' | 'typewriter' | 'zoom' | 'glitch' | 'wipe';
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowBlur?: number;
  shadowColor?: string;
  isItalic?: boolean;
}

export interface TimelineClip {
  id: string;
  mediaId?: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  start: number; // timeline start in seconds
  duration: number; // seconds
  trimStart: number;
  trimEnd: number;
  speed: number;
  volume: number;
  isMuted?: boolean;
  filter?: string; // 'none' | 'cinematic' | 'vibrant' | 'warm' | 'cool' | 'noir' | 'vintage' | 'cyberpunk' | etc.
  adjustments?: VideoAdjustment;
  effects?: ClipEffect[];
  keyframes?: ClipKeyframe[];
  transition?: ClipTransition;
  crop?: { x: number; y: number; width: number; height: number };
  positionX?: number; // offset in px
  positionY?: number;
  scale?: number;
  rotation?: number; // degrees
  flipH?: boolean;
  flipV?: boolean;
  opacity?: number; // 0 to 1
  blendMode?: string;
  reverse?: boolean;
  isFreeze?: boolean;
  removeBackground?: boolean;
  bgKeyColor?: string;
  bgReplaceColor?: string;
  // For text clips:
  text?: string;
  style?: TextStyle;
  // For sticker clips:
  sticker?: StickerData;
  // For audio clips:
  fadeIn?: number;
  fadeOut?: number;
  pitch?: number;
  loop?: boolean;
  noiseReduction?: boolean;
  voiceEnhance?: boolean;
  normalize?: boolean;
  peaks?: number[];
}

export interface TimelineTrack {
  id: string;
  type: 'video' | 'text' | 'audio' | 'sticker' | 'effects';
  name: string;
  isMuted?: boolean;
  isLocked?: boolean;
  isSolo?: boolean;
  isHidden?: boolean;
  volume?: number;
  clips: TimelineClip[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  fps: FrameRate;
  duration: number;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  tracks: TimelineTrack[];
}

export interface TemplateSlot {
  index: number;
  duration: number;
  label: string;
  transition: string;
  textOverlay?: string;
  mediaType?: 'video' | 'image';
}

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  templateType: 'ready_video' | 'editable';
  badge: 'READY VIDEO' | 'EDITABLE';
  duration: number;
  aspectRatio: AspectRatio;
  requiredClips: number;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
  likes?: string;
  views?: string;
  filter?: string;
  effect?: string;
  musicTrack?: string;
  slots: TemplateSlot[];
}

export interface ExportConfig {
  resolution: Resolution;
  fps: FrameRate;
  aspectRatio: AspectRatio;
  format: VideoFormat;
  quality: ExportQuality;
  canvasMode?: 'fit' | 'fill';
  backgroundColor?: string;
  autoDucking?: boolean;
  duckingAmount?: number;
}

export interface ExportJobStatus {
  jobId: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  stage: string;
  progress: number;
  error?: string;
  outputFilename?: string;
  downloadUrl?: string;
  previewUrl?: string;
  fileSize?: number;
  startedAt?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
  duration?: number;
}

export interface CaptionWord {
  word: string;
  start: number;
  end: number;
}

export interface CaptionSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  words: CaptionWord[];
  style: TextStyle;
}
