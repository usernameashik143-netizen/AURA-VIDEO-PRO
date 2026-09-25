import path from 'path';
import fs from 'fs';
import { SEEDS_DIR, MEDIA_FILE } from '../config.js';

export interface AudioItem {
  id: string;
  name: string;
  category: string;
  duration: number;
  url: string;
  artist: string;
  license: string;
  bpm: number;
  tags: string[];
  peaks: number[];
}

// 20 Standard categories of licensed/royalty-free audio assets
export const AUDIO_CATEGORIES = [
  'Music',
  'BGM',
  'Sound Effects',
  'Ambient',
  'Cinematic',
  'Chill',
  'Emotional',
  'Energetic',
  'Travel',
  'Vlog',
  'Fashion',
  'Corporate',
  'Dramatic',
  'Lo-fi',
  'Sports',
  'Wedding',
  'Birthday',
  'Motivational',
  'Documentary',
  'Suspense',
] as const;

// Generate procedural waveform peaks for visual rendering
function generatePeaks(count = 60, seed = 1): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    const v = 0.2 + Math.abs(Math.sin((i + seed) * 0.4) * 0.6) + Math.abs(Math.cos(i * 0.8) * 0.2);
    peaks.push(parseFloat(Math.min(1.0, v).toFixed(2)));
  }
  return peaks;
}

export class AudioService {
  private static catalog: AudioItem[] = [
    // 1. Cinematic
    {
      id: 'audio-cinematic-horizon',
      name: 'Cinematic Horizon Pulse',
      category: 'Cinematic',
      duration: 30,
      url: '/seeds/cinematic_horizon.mp3',
      artist: 'Aura Studio Orchestra',
      license: 'Royalty-Free / CC-BY 4.0',
      bpm: 100,
      tags: ['epic', 'dramatic', 'orchestral', 'strings'],
      peaks: generatePeaks(60, 1),
    },
    // 2. Dramatic
    {
      id: 'audio-dramatic-trailer',
      name: 'Dramatic Hybrid Trailer',
      category: 'Dramatic',
      duration: 30,
      url: '/seeds/dramatic_trailer.mp3',
      artist: 'Vanguard Soundworks',
      license: 'Royalty-Free / CC0',
      bpm: 135,
      tags: ['climax', 'trailer', 'heroic', 'braam'],
      peaks: generatePeaks(60, 2),
    },
    // 3. Lo-Fi
    {
      id: 'audio-lofi-night',
      name: 'Lo-Fi Midnight Cruiser',
      category: 'Lo-fi',
      duration: 30,
      url: '/seeds/lofi_night_drive.mp3',
      artist: 'Neon Chill Hop',
      license: 'Royalty-Free / CC-BY 4.0',
      bpm: 82,
      tags: ['chill', 'study', 'relaxing', 'lofi'],
      peaks: generatePeaks(60, 3),
    },
    // 4. Chill Travel
    {
      id: 'audio-travel-breeze',
      name: 'Chill Travel Breeze',
      category: 'Travel',
      duration: 30,
      url: '/seeds/chill_travel_breeze.mp3',
      artist: 'Aura Folk Strings',
      license: 'Royalty-Free / CC-BY 4.0',
      bpm: 105,
      tags: ['guitar', 'sunshine', 'roadtrip', 'travel'],
      peaks: generatePeaks(60, 4),
    },
    // 5. Energetic Reel Beat
    {
      id: 'audio-energetic-reel',
      name: 'Energetic Reel Beat',
      category: 'Energetic',
      duration: 30,
      url: '/seeds/energetic_reel_beat.mp3',
      artist: 'Electro Pulse Labs',
      license: 'Royalty-Free / CC-BY 4.0',
      bpm: 128,
      tags: ['fast', 'edm', 'club', 'drop', 'reel'],
      peaks: generatePeaks(60, 5),
    },
    // 6. Emotional Piano
    {
      id: 'audio-emotional-piano',
      name: 'Emotional Piano Reflection',
      category: 'Emotional',
      duration: 30,
      url: '/seeds/emotional_piano.mp3',
      artist: 'Gentle Waves',
      license: 'Royalty-Free / CC0',
      bpm: 72,
      tags: ['piano', 'acoustic', 'love', 'romantic'],
      peaks: generatePeaks(60, 6),
    },
    // 7. Fashion Runway
    {
      id: 'audio-fashion-stride',
      name: 'Fashion Runway House',
      category: 'Fashion',
      duration: 30,
      url: '/seeds/fashion_runway.mp3',
      artist: 'Atelier Sound',
      license: 'Royalty-Free / CC-BY 4.0',
      bpm: 124,
      tags: ['luxury', 'strut', 'chic', 'minimal'],
      peaks: generatePeaks(60, 7),
    },
    // 8. Creator Vlog
    {
      id: 'audio-vlog-daily',
      name: 'Creator Vlog Ukulele',
      category: 'Vlog',
      duration: 30,
      url: '/seeds/creator_vlog.mp3',
      artist: 'Everyday Grooves',
      license: 'Royalty-Free / CC0',
      bpm: 115,
      tags: ['vlog', 'casual', 'happy', 'bright'],
      peaks: generatePeaks(60, 8),
    },
    // 9. Documentary Ambient
    {
      id: 'audio-documentary-ambient',
      name: 'Documentary Ambient Pulse',
      category: 'Documentary',
      duration: 30,
      url: '/seeds/documentary_ambient.mp3',
      artist: 'Heritage Sound',
      license: 'Royalty-Free / CC0',
      bpm: 90,
      tags: ['nature', 'story', 'authentic', 'drone'],
      peaks: generatePeaks(60, 9),
    },
    // 10. Sunshine Acoustic Joy (Happy)
    {
      id: 'audio-acoustic-joy',
      name: 'Sunshine Acoustic Joy',
      category: 'Happy',
      duration: 30,
      url: '/seeds/acoustic_joy.mp3',
      artist: 'Joyful Sparks',
      license: 'Royalty-Free / CC0',
      bpm: 120,
      tags: ['party', 'joy', 'cheer', 'dance'],
      peaks: generatePeaks(60, 10),
    },
    // Sound Effects & Ambient
    {
      id: 'audio-sfx-whoosh',
      name: 'Cinematic Air Whoosh',
      category: 'Sound Effects',
      duration: 2.5,
      url: '/seeds/energetic_reel_beat.mp3',
      artist: 'Foley Pro FX',
      license: 'Royalty-Free / CC0',
      bpm: 0,
      tags: ['sfx', 'transition', 'swoosh', 'flyby'],
      peaks: generatePeaks(20, 17),
    },
    {
      id: 'audio-ambient-rain',
      name: 'Soft Window Rain & Wind',
      category: 'Ambient',
      duration: 35,
      url: '/seeds/lofi_night_drive.mp3',
      artist: 'Atmosphere Sound',
      license: 'Royalty-Free / CC0',
      bpm: 0,
      tags: ['rain', 'weather', 'drone', 'calm'],
      peaks: generatePeaks(60, 18),
    },
  ];

  /**
   * Get audio library filtered by category and search query
   */
  static getLibrary(category?: string, query?: string): AudioItem[] {
    let list = [...this.catalog];

    // Include user uploaded audio files from media.json
    if (fs.existsSync(MEDIA_FILE)) {
      try {
        const userMedia = JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
        const userAudio = userMedia
          .filter((m: any) => m.type === 'audio')
          .map((m: any) => ({
            id: m.id,
            name: m.name,
            category: 'User Uploads',
            duration: m.duration || 30,
            url: m.url,
            artist: 'Local Upload',
            license: 'User Owned',
            bpm: 120,
            tags: ['user', 'upload', 'custom'],
            peaks: generatePeaks(60, m.name.length),
          }));
        list = [...userAudio, ...list];
      } catch {}
    }

    if (category && category !== 'All' && category !== 'Music') {
      list = list.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.artist.toLowerCase().includes(q) ||
          item.tags.some((t) => t.includes(q))
      );
    }

    return list;
  }

  /**
   * Detect audio beats for a given audio track or BPM
   * Returns array of timestamps in seconds where beats occur
   */
  static detectBeats(duration: number, bpm = 120): number[] {
    const beats: number[] = [];
    const interval = 60 / Math.max(40, Math.min(220, bpm));
    for (let t = 0.2; t < duration; t += interval) {
      beats.push(parseFloat(t.toFixed(3)));
    }
    return beats;
  }

  /**
   * Generate normalized waveform peak array
   */
  static getWaveformPeaks(seed = 1, sampleCount = 60): number[] {
    return generatePeaks(sampleCount, seed);
  }
}
