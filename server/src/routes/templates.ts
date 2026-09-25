import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MEDIA_FILE, PROJECTS_FILE } from '../config.js';
import { MediaItem } from '../services/seedService.js';

const router = Router();

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
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  requiredClips: number;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string; // For ready_video: direct playable video URL
  likes?: string;
  views?: string;
  filter?: string;
  effect?: string;
  musicTrack?: string;
  slots: TemplateSlot[];
}

const TEMPLATES: TemplateDef[] = [
  // ==========================================
  // TYPE 1: READY-MADE VIDEO TEMPLATES
  // Completed, pre-rendered videos that play immediately
  // ==========================================
  {
    id: 'tmpl-ready-cinematic-vibes',
    name: 'Cinematic Vibes',
    category: 'Cinematic',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 15,
    aspectRatio: '9:16',
    requiredClips: 1,
    description: 'Breathtaking 9:16 vertical cinematic reel with dramatic color grading and Taiko orchestral beats.',
    thumbnailUrl: '/thumbnails/poster-cinematic.svg',
    videoUrl: '/seeds/ready_cinematic_vibes.mp4',
    likes: '12.4K',
    views: '88.5K',
    filter: 'cinematic',
    musicTrack: 'Cinematic Horizon',
    slots: [
      { index: 1, duration: 15.0, label: 'Master Cut', transition: 'fade' },
    ],
  },
  {
    id: 'tmpl-ready-love-story',
    name: 'Love Story',
    category: 'Memories',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 12,
    aspectRatio: '9:16',
    requiredClips: 1,
    description: 'Gentle romantic memory reel with soft warm grades and heartfelt grand piano melody.',
    thumbnailUrl: '/thumbnails/poster-love.svg',
    videoUrl: '/seeds/ready_love_story.mp4',
    likes: '9.8K',
    views: '64.2K',
    filter: 'vintage',
    musicTrack: 'Emotional Piano',
    slots: [
      { index: 1, duration: 12.0, label: 'Master Cut', transition: 'dissolve' },
    ],
  },
  {
    id: 'tmpl-ready-travel-diaries',
    name: 'Travel Diaries',
    category: 'Travel',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 16,
    aspectRatio: '16:9',
    requiredClips: 1,
    description: 'Golden hour travel landscape montage with scenic vistas and upbeat acoustic breeze accompaniment.',
    thumbnailUrl: '/thumbnails/poster-travel.svg',
    videoUrl: '/seeds/ready_travel_diaries.mp4',
    likes: '7.6K',
    views: '49.1K',
    filter: 'golden_hour',
    musicTrack: 'Chill Travel Breeze',
    slots: [
      { index: 1, duration: 16.0, label: 'Master Cut', transition: 'fade' },
    ],
  },
  {
    id: 'tmpl-ready-dark-aesthetic',
    name: 'Dark Aesthetic',
    category: 'Trending',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 14,
    aspectRatio: '9:16',
    requiredClips: 1,
    description: 'Moody, high-contrast monochrome street vibes synchronized to mellow lo-fi boom-bap rhythm.',
    thumbnailUrl: '/thumbnails/poster-dark.svg',
    videoUrl: '/seeds/ready_dark_aesthetic.mp4',
    likes: '6.2K',
    views: '42.7K',
    filter: 'noir',
    musicTrack: 'Lo-Fi Night Drive',
    slots: [
      { index: 1, duration: 14.0, label: 'Master Cut', transition: 'glitch' },
    ],
  },
  {
    id: 'tmpl-ready-nature-escape',
    name: 'Nature Escape',
    category: 'Travel',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 16,
    aspectRatio: '16:9',
    requiredClips: 1,
    description: 'Majestic mountain drones, rich green palettes, and atmospheric documentary ambient soundscape.',
    thumbnailUrl: '/thumbnails/poster-nature.svg',
    videoUrl: '/seeds/ready_nature_escape.mp4',
    likes: '5.4K',
    views: '38.0K',
    filter: 'fuji_velvia',
    musicTrack: 'Documentary Ambient',
    slots: [
      { index: 1, duration: 16.0, label: 'Master Cut', transition: 'fade' },
    ],
  },
  {
    id: 'tmpl-ready-slow-motion',
    name: 'Slow Motion',
    category: 'Shorts',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 13,
    aspectRatio: '9:16',
    requiredClips: 1,
    description: 'High-tension dramatic speed ramp with intense cinematic pulse and deep bass drops.',
    thumbnailUrl: '/thumbnails/poster-slowmo.svg',
    videoUrl: '/seeds/ready_slow_motion.mp4',
    likes: '4.8K',
    views: '31.5K',
    filter: 'dramatic_contrast',
    musicTrack: 'Dramatic Trailer',
    slots: [
      { index: 1, duration: 13.0, label: 'Master Cut', transition: 'zoom' },
    ],
  },
  {
    id: 'tmpl-ready-fashion-reel',
    name: 'Fashion Reel',
    category: 'Fashion',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 18,
    aspectRatio: '9:16',
    requiredClips: 1,
    description: 'Luxury editorial lookbook with sleek cuts and punchy electro chic runway bassline.',
    thumbnailUrl: '/thumbnails/poster-fashion.svg',
    videoUrl: '/seeds/ready_fashion_reel.mp4',
    likes: '15.1K',
    views: '102.3K',
    filter: 'editorial',
    musicTrack: 'Fashion Runway',
    slots: [
      { index: 1, duration: 18.0, label: 'Master Cut', transition: 'slide' },
    ],
  },
  {
    id: 'tmpl-ready-birthday-special',
    name: 'Birthday Special',
    category: 'Birthday',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 15,
    aspectRatio: '1:1',
    requiredClips: 1,
    description: 'Joyous square birthday party sizzle with confetti pops and bright acoustic sunshine chords.',
    thumbnailUrl: '/thumbnails/poster-birthday.svg',
    videoUrl: '/seeds/ready_birthday_special.mp4',
    likes: '8.3K',
    views: '55.9K',
    filter: 'vibrant',
    musicTrack: 'Acoustic Joy',
    slots: [
      { index: 1, duration: 15.0, label: 'Master Cut', transition: 'fade' },
    ],
  },
  {
    id: 'tmpl-ready-wedding-moments',
    name: 'Wedding Moments',
    category: 'Wedding',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 22,
    aspectRatio: '16:9',
    requiredClips: 1,
    description: 'Elegant widescreen wedding highlight reel with timeless film curves and tender acoustic piano.',
    thumbnailUrl: '/thumbnails/poster-wedding.svg',
    videoUrl: '/seeds/ready_wedding_moments.mp4',
    likes: '11.2K',
    views: '76.4K',
    filter: 'kodak_portra',
    musicTrack: 'Emotional Piano',
    slots: [
      { index: 1, duration: 22.0, label: 'Master Cut', transition: 'dissolve' },
    ],
  },
  {
    id: 'tmpl-ready-sports-motion',
    name: 'Sports Motion Rush',
    category: 'Sports',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 14,
    aspectRatio: '9:16',
    requiredClips: 1,
    description: 'Adrenaline-packed athletic workout reel with fast zoom transitions and high-tempo beat.',
    thumbnailUrl: '/thumbnails/poster-sports.svg',
    videoUrl: '/seeds/ready_sports_motion.mp4',
    likes: '9.5K',
    views: '63.8K',
    filter: 'pop_punch',
    musicTrack: 'Energetic Reel Beat',
    slots: [
      { index: 1, duration: 14.0, label: 'Master Cut', transition: 'glitch' },
    ],
  },
  {
    id: 'tmpl-ready-beat-sync',
    name: 'Urban Beat Sync',
    category: 'Beat Sync',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 15,
    aspectRatio: '9:16',
    requiredClips: 1,
    description: 'Microsecond rhythmic cuts locked to the kick and snare drums for maximum social retention.',
    thumbnailUrl: '/thumbnails/poster-beatsync.svg',
    videoUrl: '/seeds/ready_beat_sync.mp4',
    likes: '18.9K',
    views: '135.0K',
    filter: 'cyberpunk',
    musicTrack: 'Energetic Reel Beat',
    slots: [
      { index: 1, duration: 15.0, label: 'Master Cut', transition: 'glitch' },
    ],
  },
  {
    id: 'tmpl-ready-festival-lights',
    name: 'Festival Lights',
    category: 'Trending',
    templateType: 'ready_video',
    badge: 'READY VIDEO',
    duration: 20,
    aspectRatio: '16:9',
    requiredClips: 1,
    description: 'Glowing night festival celebration with shimmering light leaks and grand cinematic climax.',
    thumbnailUrl: '/thumbnails/poster-festival.svg',
    videoUrl: '/seeds/ready_festival_lights.mp4',
    likes: '7.9K',
    views: '51.4K',
    filter: 'blockbuster',
    musicTrack: 'Cinematic Horizon',
    slots: [
      { index: 1, duration: 20.0, label: 'Master Cut', transition: 'fade' },
    ],
  },

  // ==========================================
  // TYPE 2: EDITABLE TEMPLATES
  // Structured multi-slot blueprints for customizable creation
  // ==========================================
  {
    id: 'tmpl-edit-travel-cinematic',
    name: 'Travel Cinematic',
    category: 'Travel',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 18,
    aspectRatio: '9:16',
    requiredClips: 4,
    description: 'Fully customizable 4-scene vertical travel story with 2 title overlays and rhythm-matched transitions.',
    thumbnailUrl: '/thumbnails/poster-travel.svg',
    filter: 'golden_hour',
    effect: 'film_grain',
    musicTrack: 'Chill Travel Breeze',
    slots: [
      { index: 1, duration: 4.5, label: 'Scene 1: Departure Hook', transition: 'zoom', textOverlay: 'DAY ONE ✈️', mediaType: 'video' },
      { index: 2, duration: 4.5, label: 'Scene 2: Mountain Vista', transition: 'wipeleft', mediaType: 'video' },
      { index: 3, duration: 4.5, label: 'Scene 3: Hidden Oasis', transition: 'zoom', textOverlay: 'PARADISE FOUND', mediaType: 'video' },
      { index: 4, duration: 4.5, label: 'Scene 4: Sunset Outro', transition: 'fade', mediaType: 'video' },
    ],
  },
  {
    id: 'tmpl-edit-viral-reel',
    name: 'Trending Viral Reel',
    category: 'Reels',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 15,
    aspectRatio: '9:16',
    requiredClips: 4,
    description: 'Punchy 4-clip reel template with high-contrast grading, beat cuts, and attention-grabbing typography.',
    thumbnailUrl: '/thumbnails/poster-beatsync.svg',
    filter: 'vibrant',
    effect: 'glitch',
    musicTrack: 'Energetic Reel Beat',
    slots: [
      { index: 1, duration: 2.5, label: 'Scene 1: 2-Sec Hook', transition: 'glitch', textOverlay: 'WAIT FOR IT ⚡', mediaType: 'video' },
      { index: 2, duration: 3.5, label: 'Scene 2: Quick Build', transition: 'slide', mediaType: 'video' },
      { index: 3, duration: 4.5, label: 'Scene 3: Climax Drop', transition: 'zoom', textOverlay: 'UNBELIEVABLE 🔥', mediaType: 'video' },
      { index: 4, duration: 4.5, label: 'Scene 4: Follow CTA', transition: 'fade', mediaType: 'video' },
    ],
  },
  {
    id: 'tmpl-edit-yt-shorts',
    name: 'Shorts Hook & Flow',
    category: 'Shorts',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 20,
    aspectRatio: '9:16',
    requiredClips: 3,
    description: 'Algorithmic watch-time optimized 3-act structure for YouTube Shorts and vertical platforms.',
    thumbnailUrl: '/thumbnails/poster-slowmo.svg',
    filter: 'clean_modern',
    effect: 'vignette',
    musicTrack: 'Energetic Reel Beat',
    slots: [
      { index: 1, duration: 4.0, label: 'Scene 1: Secret Tip', transition: 'slide', textOverlay: 'TOP SECRET TIP', mediaType: 'video' },
      { index: 2, duration: 8.0, label: 'Scene 2: Demonstration', transition: 'dissolve', mediaType: 'video' },
      { index: 3, duration: 8.0, label: 'Scene 3: Subscribe CTA', transition: 'fade', textOverlay: 'SUBSCRIBE FOR MORE', mediaType: 'video' },
    ],
  },
  {
    id: 'tmpl-edit-8k-widescreen',
    name: '8K Cinematic Widescreen',
    category: 'Cinematic',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 24,
    aspectRatio: '16:9',
    requiredClips: 4,
    description: 'Epic 16:9 widescreen cinema narrative with slow dissolves, letterbox bars, and orchestral strings.',
    thumbnailUrl: '/thumbnails/poster-cinematic.svg',
    filter: 'cinematic',
    effect: 'letterbox',
    musicTrack: 'Cinematic Horizon',
    slots: [
      { index: 1, duration: 6.0, label: 'Scene 1: Establishing Shot', transition: 'dissolve', textOverlay: 'CHAPTER ONE', mediaType: 'video' },
      { index: 2, duration: 6.0, label: 'Scene 2: Detail Focus', transition: 'dissolve', mediaType: 'video' },
      { index: 3, duration: 6.0, label: 'Scene 3: Dramatic Climax', transition: 'dissolve', mediaType: 'video' },
      { index: 4, duration: 6.0, label: 'Scene 4: Fade to Black', transition: 'fade', mediaType: 'video' },
    ],
  },
  {
    id: 'tmpl-edit-fashion-lookbook',
    name: 'High Fashion Lookbook',
    category: 'Fashion',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 16,
    aspectRatio: '9:16',
    requiredClips: 4,
    description: 'Minimalist luxury aesthetic with monochrome contrast, clean lower thirds, and catwalk pacing.',
    thumbnailUrl: '/thumbnails/poster-fashion.svg',
    filter: 'noir',
    effect: 'film_grain',
    musicTrack: 'Fashion Runway',
    slots: [
      { index: 1, duration: 3.5, label: 'Scene 1: Outfit 01', transition: 'slide', textOverlay: 'COLLECTION 01', mediaType: 'video' },
      { index: 2, duration: 4.0, label: 'Scene 2: Fabric Detail', transition: 'dissolve', mediaType: 'video' },
      { index: 3, duration: 4.5, label: 'Scene 3: Full Motion', transition: 'glitch', mediaType: 'video' },
      { index: 4, duration: 4.0, label: 'Scene 4: Logo Reveal', transition: 'fade', mediaType: 'video' },
    ],
  },
  {
    id: 'tmpl-edit-golden-memories',
    name: 'Golden Memories & Wedding',
    category: 'Wedding',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 25,
    aspectRatio: '16:9',
    requiredClips: 4,
    description: 'Heartwarming acoustic wedding and anniversary montage with gentle crossfades and vintage curves.',
    thumbnailUrl: '/thumbnails/poster-wedding.svg',
    filter: 'vintage',
    effect: 'bloom',
    musicTrack: 'Emotional Piano',
    slots: [
      { index: 1, duration: 6.0, label: 'Scene 1: Morning Prep', transition: 'dissolve', textOverlay: 'TOGETHER FOREVER', mediaType: 'video' },
      { index: 2, duration: 6.5, label: 'Scene 2: The Ceremony', transition: 'dissolve', mediaType: 'video' },
      { index: 3, duration: 6.5, label: 'Scene 3: Joyous Moments', transition: 'dissolve', mediaType: 'video' },
      { index: 4, duration: 6.0, label: 'Scene 4: First Dance', transition: 'fade', mediaType: 'video' },
    ],
  },
  {
    id: 'tmpl-edit-birthday-party',
    name: 'Birthday Celebration Blast',
    category: 'Birthday',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 15,
    aspectRatio: '1:1',
    requiredClips: 3,
    description: 'Square format party sizzle reel with vibrant saturation, pop titles, and energetic beat.',
    thumbnailUrl: '/thumbnails/poster-birthday.svg',
    filter: 'vibrant',
    effect: 'flash',
    musicTrack: 'Acoustic Joy',
    slots: [
      { index: 1, duration: 4.0, label: 'Scene 1: The Surprise', transition: 'zoom', textOverlay: 'HAPPY BIRTHDAY! 🎂', mediaType: 'video' },
      { index: 2, duration: 5.5, label: 'Scene 2: Cake Cutting', transition: 'glitch', mediaType: 'video' },
      { index: 3, duration: 5.5, label: 'Scene 3: Celebration Cheers', transition: 'fade', textOverlay: 'CHEERS TO ANOTHER YEAR', mediaType: 'video' },
    ],
  },
  {
    id: 'tmpl-edit-product-showcase',
    name: 'Modern Product Showcase',
    category: 'Business',
    templateType: 'editable',
    badge: 'EDITABLE',
    duration: 18,
    aspectRatio: '16:9',
    requiredClips: 3,
    description: 'Sleek product reveal structure with zoom reveals, crisp typography, and cinematic electronic score.',
    thumbnailUrl: '/thumbnails/poster-business.svg',
    filter: 'clean_modern',
    effect: 'vignette',
    musicTrack: 'Cinematic Horizon',
    slots: [
      { index: 1, duration: 5.0, label: 'Scene 1: Hero Reveal', transition: 'zoom', textOverlay: 'INTRODUCING AURA', mediaType: 'video' },
      { index: 2, duration: 6.5, label: 'Scene 2: Core Feature', transition: 'slide', textOverlay: 'UNRIVALED SPEED', mediaType: 'video' },
      { index: 3, duration: 6.5, label: 'Scene 3: Order Now', transition: 'fade', textOverlay: 'AVAILABLE NOW', mediaType: 'video' },
    ],
  },
];

/**
 * GET /api/templates - list all templates with dual template categorization
 */
router.get('/', (req, res) => {
  const { type, category } = req.query;
  let filtered = [...TEMPLATES];

  if (type && type !== 'all') {
    filtered = filtered.filter((t) => t.templateType === type);
  }

  if (category && category !== 'all' && category !== 'All') {
    filtered = filtered.filter((t) => t.category.toLowerCase() === (category as string).toLowerCase());
  }

  res.json({ success: true, data: filtered });
});

/**
 * GET /api/templates/:id - get single template detail
 */
router.get('/:id', (req, res) => {
  const template = TEMPLATES.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }
  res.json({ success: true, data: template });
});

/**
 * Helper to retrieve media map
 */
function getMediaItems(): MediaItem[] {
  if (fs.existsSync(MEDIA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * POST /api/templates/:id/apply - fit user clips into template slots automatically
 */
router.post('/:id/apply', (req, res) => {
  try {
    const { id } = req.params;
    const { mediaIds = [], customTitle } = req.body;
    const template = TEMPLATES.find((t) => t.id === id);

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const allMedia = getMediaItems();
    const availableClips = allMedia.filter((m) => mediaIds.includes(m.id) && m.type === 'video');
    const fallbackClips = allMedia.filter((m) => m.type === 'video');
    const clipsToUse = availableClips.length > 0 ? availableClips : fallbackClips;

    if (clipsToUse.length === 0) {
      return res.status(400).json({ success: false, error: 'No video clips available to fit template' });
    }

    let currentTimelineTime = 0;
    const videoClips: any[] = [];
    const textClips: any[] = [];

    template.slots.forEach((slot, idx) => {
      const media = clipsToUse[idx % clipsToUse.length];
      const slotDur = slot.duration;
      const trimStart = 0;
      const trimEnd = Math.min(media.duration || slotDur, slotDur);

      videoClips.push({
        id: `clip-tmpl-${idx + 1}-${uuidv4().slice(0, 4)}`,
        mediaId: media.id,
        name: media.name,
        url: media.url,
        filePath: media.filePath,
        start: parseFloat(currentTimelineTime.toFixed(2)),
        duration: slotDur,
        trimStart,
        trimEnd,
        speed: 1,
        volume: 1,
        filter: template.filter,
        transition: {
          type: slot.transition,
          duration: 0.6,
        },
      });

      if (slot.textOverlay) {
        textClips.push({
          id: `text-tmpl-${idx + 1}-${uuidv4().slice(0, 4)}`,
          text: slot.textOverlay,
          start: parseFloat((currentTimelineTime + 0.3).toFixed(2)),
          duration: parseFloat((slotDur * 0.75).toFixed(2)),
          style: {
            fontSize: 40,
            fontWeight: 'bold',
            fontFamily: 'Plus Jakarta Sans',
            color: '#ffffff',
            position: 'center',
            animation: 'pop',
          },
        });
      }

      currentTimelineTime += slotDur;
    });

    const bgmItem = allMedia.find((m) => m.type === 'audio' && template.musicTrack && m.name.includes(template.musicTrack)) ||
      allMedia.find((m) => m.type === 'audio');

    const audioClips: any[] = [];
    if (bgmItem) {
      audioClips.push({
        id: `bgm-tmpl-${uuidv4().slice(0, 4)}`,
        mediaId: bgmItem.id,
        name: bgmItem.name,
        url: bgmItem.url,
        filePath: bgmItem.filePath,
        start: 0,
        duration: currentTimelineTime,
        trimStart: 0,
        volume: 0.6,
        fadeIn: 0.4,
        fadeOut: 0.8,
      });
    }

    const newProject = {
      id: `proj-${uuidv4().slice(0, 8)}`,
      title: customTitle || `${template.name} Project`,
      aspectRatio: template.aspectRatio,
      resolution: '1080p',
      fps: 30,
      duration: parseFloat(currentTimelineTime.toFixed(2)),
      thumbnailUrl: template.thumbnailUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks: [
        {
          id: 'track-video-primary',
          type: 'video',
          name: 'Main Video',
          clips: videoClips,
        },
        {
          id: 'track-text-primary',
          type: 'text',
          name: 'Titles & Captions',
          clips: textClips,
        },
        {
          id: 'track-audio-primary',
          type: 'audio',
          name: 'Background Music',
          clips: audioClips,
        },
      ],
    };

    saveProjectToFile(newProject);
    res.json({ success: true, data: newProject });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/templates/:id/customize - customize specific slots (media, text, music, filter, effect)
 */
router.post('/:id/customize', (req, res) => {
  try {
    const { id } = req.params;
    const {
      slotMedia = {}, // { [slotIndex]: mediaId }
      slotText = {}, // { [slotIndex]: customText }
      musicTrackId,
      filter,
      effect,
      customTitle,
    } = req.body;

    const template = TEMPLATES.find((t) => t.id === id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const allMedia = getMediaItems();
    const mediaMap = new Map<string, MediaItem>();
    allMedia.forEach((m) => mediaMap.set(m.id, m));

    const fallbackVideos = allMedia.filter((m) => m.type === 'video');

    let currentTimelineTime = 0;
    const videoClips: any[] = [];
    const textClips: any[] = [];

    const activeFilter = filter !== undefined ? filter : template.filter;
    const activeEffect = effect !== undefined ? effect : template.effect;

    template.slots.forEach((slot) => {
      const chosenMediaId = slotMedia[slot.index];
      let media = chosenMediaId ? mediaMap.get(chosenMediaId) : null;
      if (!media && fallbackVideos.length > 0) {
        media = fallbackVideos[(slot.index - 1) % fallbackVideos.length];
      }

      const slotDur = slot.duration;
      const trimStart = 0;
      const trimEnd = media ? Math.min(media.duration || slotDur, slotDur) : slotDur;

      if (media) {
        videoClips.push({
          id: `clip-custom-${slot.index}-${uuidv4().slice(0, 4)}`,
          mediaId: media.id,
          name: media.name,
          url: media.url,
          filePath: media.filePath,
          start: parseFloat(currentTimelineTime.toFixed(2)),
          duration: slotDur,
          trimStart,
          trimEnd,
          speed: 1,
          volume: 1,
          filter: activeFilter,
          effects: activeEffect ? [{ type: activeEffect, intensity: 60, enabled: true }] : undefined,
          transition: {
            type: slot.transition,
            duration: 0.6,
          },
        });
      }

      const customTextValue = slotText[slot.index] !== undefined ? slotText[slot.index] : slot.textOverlay;
      if (customTextValue && customTextValue.trim()) {
        textClips.push({
          id: `text-custom-${slot.index}-${uuidv4().slice(0, 4)}`,
          text: customTextValue.trim(),
          start: parseFloat((currentTimelineTime + 0.3).toFixed(2)),
          duration: parseFloat((slotDur * 0.75).toFixed(2)),
          style: {
            fontSize: 42,
            fontWeight: 'bold',
            fontFamily: 'Plus Jakarta Sans',
            color: '#ffffff',
            position: 'center',
            animation: 'pop',
          },
        });
      }

      currentTimelineTime += slotDur;
    });

    let selectedBgm: MediaItem | undefined;
    if (musicTrackId) {
      selectedBgm = mediaMap.get(musicTrackId);
    }
    if (!selectedBgm && template.musicTrack) {
      selectedBgm = allMedia.find((m) => m.type === 'audio' && template.musicTrack && m.name.includes(template.musicTrack));
    }
    if (!selectedBgm) {
      selectedBgm = allMedia.find((m) => m.type === 'audio');
    }

    const audioClips: any[] = [];
    if (selectedBgm) {
      audioClips.push({
        id: `bgm-custom-${uuidv4().slice(0, 4)}`,
        mediaId: selectedBgm.id,
        name: selectedBgm.name,
        url: selectedBgm.url,
        filePath: selectedBgm.filePath,
        start: 0,
        duration: currentTimelineTime,
        trimStart: 0,
        volume: 0.65,
        fadeIn: 0.4,
        fadeOut: 0.8,
      });
    }

    const newProject = {
      id: `proj-${uuidv4().slice(0, 8)}`,
      title: customTitle || `${template.name} Custom`,
      aspectRatio: template.aspectRatio,
      resolution: '1080p',
      fps: 30,
      duration: parseFloat(currentTimelineTime.toFixed(2)),
      thumbnailUrl: template.thumbnailUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks: [
        {
          id: 'track-video-primary',
          type: 'video',
          name: 'Main Video',
          clips: videoClips,
        },
        {
          id: 'track-text-primary',
          type: 'text',
          name: 'Titles & Captions',
          clips: textClips,
        },
        {
          id: 'track-audio-primary',
          type: 'audio',
          name: 'Background Music',
          clips: audioClips,
        },
      ],
    };

    saveProjectToFile(newProject);
    res.json({ success: true, data: newProject });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function saveProjectToFile(proj: any) {
  let projects: any[] = [];
  if (fs.existsSync(PROJECTS_FILE)) {
    try {
      projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    } catch {}
  }
  projects.unshift(proj);
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  } catch {}
}

export default router;
