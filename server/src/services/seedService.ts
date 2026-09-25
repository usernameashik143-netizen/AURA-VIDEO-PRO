import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SEEDS_DIR, THUMBNAILS_DIR, MEDIA_FILE, PROJECTS_FILE } from '../config.js';
import { FFmpegService } from './ffmpegService.js';

const execAsync = promisify(exec);

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

export class SeedService {
  static async seedInitialMedia(): Promise<void> {
    // If media.json exists and has items, check if files are on disk
    let currentMedia: MediaItem[] = [];
    if (fs.existsSync(MEDIA_FILE)) {
      try {
        currentMedia = JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
      } catch (e) {
        currentMedia = [];
      }
    }

    console.log('Verifying and seeding sample clips and background music...');

    const rootFont = path.resolve('arial.ttf');
    if (!fs.existsSync(rootFont) && fs.existsSync('C:/Windows/Fonts/arial.ttf')) {
      try {
        fs.copyFileSync('C:/Windows/Fonts/arial.ttf', rootFont);
      } catch (e) {}
    }

    const clipDefs = [
      {
        id: 'seed-clip-1',
        filename: 'cyberpunk_neon_city.mp4',
        name: 'Cyberpunk Neon City',
        duration: 8,
        colorFilter: 'testsrc2=size=1920x1080:rate=30',
        audioSynth: 'sine=frequency=220:duration=8',
      },
      {
        id: 'seed-clip-2',
        filename: 'nature_drone_mountains.mp4',
        name: 'Nature Drone Mountains',
        duration: 10,
        colorFilter: 'mandelbrot=size=1920x1080:rate=30:maxiter=100',
        audioSynth: 'sine=frequency=330:duration=10',
      },
      {
        id: 'seed-clip-3',
        filename: 'urban_street_vlog.mp4',
        name: 'Urban Street Vlog',
        duration: 7,
        colorFilter: 'smptebars=size=1920x1080:rate=30',
        audioSynth: 'sine=frequency=440:duration=7',
      },
      {
        id: 'seed-clip-4',
        filename: 'sports_motion_rush.mp4',
        name: 'Sports Motion Rush',
        duration: 9,
        colorFilter: 'testsrc2=size=1080x1920:rate=30', // vertical 9:16
        audioSynth: 'sine=frequency=550:duration=9',
      },
    ];

    const seededItems: MediaItem[] = [...currentMedia];

    for (const clip of clipDefs) {
      const filePath = path.join(SEEDS_DIR, clip.filename);
      const thumbPath = path.join(THUMBNAILS_DIR, `${clip.id}.jpg`);

      if (!fs.existsSync(filePath)) {
        try {
          // Generate a smooth sample video with ffmpeg
          const cmd = `ffmpeg -y -f lavfi -i "${clip.colorFilter}" -f lavfi -i "${clip.audioSynth}" -t ${clip.duration} -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 128k "${filePath}"`;
          await execAsync(cmd);
        } catch (err: any) {
          console.warn(`Could not generate seed ${clip.filename}:`, err.message);
          continue;
        }
      }

      if (!fs.existsSync(thumbPath)) {
        try {
          await FFmpegService.generateThumbnail(filePath, thumbPath, 1.0);
        } catch (err) {
          console.warn(`Could not generate thumb for ${clip.filename}`);
        }
      }

      const probe = await FFmpegService.probeMedia(filePath);
      const item: MediaItem = {
        id: clip.id,
        name: clip.name,
        originalName: clip.filename,
        type: 'video',
        mimeType: 'video/mp4',
        size: fs.existsSync(filePath) ? fs.statSync(filePath).size : 1024 * 1024 * 2,
        duration: probe.duration || clip.duration,
        width: probe.width || 1920,
        height: probe.height || 1080,
        fps: probe.fps || 30,
        filePath,
        url: `/seeds/${clip.filename}`,
        thumbnailUrl: `/thumbnails/${clip.id}.jpg`,
        createdAt: new Date().toISOString(),
        aspectRatio: probe.isPortrait ? '9:16' : '16:9',
      };

      if (!seededItems.some((m) => m.id === item.id)) {
        seededItems.push(item);
      }
    }

    // Seed Music Tracks - 10 Genuinely Distinct Musical Compositions
    const musicDefs = [
      {
        id: 'seed-bgm-1',
        filename: 'cinematic_horizon.mp3',
        name: 'Cinematic Horizon',
        duration: 30,
        category: 'Cinematic',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=55:d=30" -f lavfi -i "sine=f=110:d=30" -f lavfi -i "sine=f=164.81:d=30" -f lavfi -i "sine=f=220:d=30" -f lavfi -i "anoisesrc=d=30:c=white:a=0.08" -filter_complex "[4:a]lowpass=f=200,tremolo=f=1.67:d=0.9[perc];[0:a][1:a][2:a][3:a][perc]amix=inputs=5:dropout_transition=0:normalize=0,aecho=0.8:0.7:140:0.4,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-2',
        filename: 'lofi_night_drive.mp3',
        name: 'Lo-Fi Night Drive',
        duration: 30,
        category: 'Lo-Fi',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=146.83:d=30" -f lavfi -i "sine=f=220.00:d=30" -f lavfi -i "sine=f=261.63:d=30" -f lavfi -i "sine=f=349.23:d=30" -f lavfi -i "anoisesrc=d=30:c=pink:a=0.03" -f lavfi -i "anoisesrc=d=30:c=white:a=0.07" -filter_complex "[4:a]lowpass=f=2800[crackle];[5:a]bandpass=f=1200:w=400,tremolo=f=1.37:d=0.95[snare];[0:a][1:a][2:a][3:a][crackle][snare]amix=inputs=6:dropout_transition=0:normalize=0,lowpass=f=2200,tremolo=f=2.0:d=0.35,aecho=0.7:0.6:80|160:0.3|0.2,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-3',
        filename: 'energetic_reel_beat.mp3',
        name: 'Energetic Reel Beat',
        duration: 30,
        category: 'Energetic',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=65.41:d=30" -f lavfi -i "sine=f=130.81:d=30" -f lavfi -i "sine=f=261.63:d=30" -f lavfi -i "sine=f=392.00:d=30" -f lavfi -i "sine=f=523.25:d=30" -f lavfi -i "anoisesrc=d=30:c=white:a=0.12" -filter_complex "[5:a]highpass=f=2000,tremolo=f=4.26:d=0.9[clap];[0:a][1:a][2:a][3:a][4:a][clap]amix=inputs=6:dropout_transition=0:normalize=0,tremolo=f=4.26:d=0.7,aecho=0.8:0.7:50:0.3,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-4',
        filename: 'chill_travel_breeze.mp3',
        name: 'Chill Travel Breeze',
        duration: 30,
        category: 'Travel',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=196.00:d=30" -f lavfi -i "sine=f=246.94:d=30" -f lavfi -i "sine=f=293.66:d=30" -f lavfi -i "sine=f=392.00:d=30" -f lavfi -i "anoisesrc=d=30:c=white:a=0.05" -filter_complex "[4:a]bandpass=f=6000:w=2000,tremolo=f=3.5:d=0.8[shaker];[0:a][1:a][2:a][3:a][shaker]amix=inputs=5:dropout_transition=0:normalize=0,volume=0.9,chorus=0.7:0.9:55:0.4:0.25:2,aecho=0.8:0.7:120:0.35,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-5',
        filename: 'emotional_piano.mp3',
        name: 'Emotional Piano Reflection',
        duration: 30,
        category: 'Emotional',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=110.00:d=30" -f lavfi -i "sine=f=220.00:d=30" -f lavfi -i "sine=f=261.63:d=30" -f lavfi -i "sine=f=329.63:d=30" -f lavfi -i "sine=f=440.00:d=30" -filter_complex "[0:a][1:a][2:a][3:a][4:a]amix=inputs=5:dropout_transition=0:normalize=0,volume=0.85,tremolo=f=1.2:d=0.3,aecho=0.85:0.8:200|400:0.4|0.25,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-6',
        filename: 'fashion_runway.mp3',
        name: 'Fashion Runway House',
        duration: 30,
        category: 'Fashion',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=61.74:d=30" -f lavfi -i "sine=f=123.47:d=30" -f lavfi -i "sine=f=246.94:d=30" -f lavfi -i "sine=f=370.00:d=30" -f lavfi -i "anoisesrc=d=30:c=white:a=0.1" -filter_complex "[4:a]highpass=f=7500,tremolo=f=8.27:d=0.95[hihat];[0:a][1:a][2:a][3:a][hihat]amix=inputs=5:dropout_transition=0:normalize=0,flanger=delay=3:depth=2:regen=45,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-7',
        filename: 'creator_vlog.mp3',
        name: 'Creator Vlog Ukulele',
        duration: 30,
        category: 'Vlog',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=261.63:d=30" -f lavfi -i "sine=f=329.63:d=30" -f lavfi -i "sine=f=392.00:d=30" -f lavfi -i "sine=f=523.25:d=30" -f lavfi -i "anoisesrc=d=30:c=white:a=0.09" -f lavfi -i "sine=f=880.00:d=30" -filter_complex "[4:a]bandpass=f=2400:w=800,tremolo=f=3.83:d=0.9[claps];[5:a]tremolo=f=5:d=0.5,volume=0.3[whistle];[0:a][1:a][2:a][3:a][claps][whistle]amix=inputs=6:dropout_transition=0:normalize=0,aecho=0.7:0.6:80:0.3,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-8',
        filename: 'documentary_ambient.mp3',
        name: 'Documentary Ambient Pulse',
        duration: 30,
        category: 'Documentary',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=55.00:d=30" -f lavfi -i "sine=f=82.41:d=30" -f lavfi -i "sine=f=110.00:d=30" -f lavfi -i "sine=f=164.81:d=30" -f lavfi -i "sine=f=50.00:d=30" -filter_complex "[4:a]tremolo=f=1.5:d=0.95[pulse];[0:a][1:a][2:a][3:a][pulse]amix=inputs=5:dropout_transition=0:normalize=0,aecho=0.9:0.85:300|600:0.5|0.35,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-9',
        filename: 'acoustic_joy.mp3',
        name: 'Sunshine Acoustic Joy',
        duration: 30,
        category: 'Happy',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=261.63:d=30" -f lavfi -i "sine=f=329.63:d=30" -f lavfi -i "sine=f=392.00:d=30" -f lavfi -i "sine=f=493.88:d=30" -f lavfi -i "sine=f=587.33:d=30" -f lavfi -i "anoisesrc=d=30:c=white:a=0.08" -filter_complex "[5:a]highpass=f=5000,tremolo=f=4.0:d=0.85[tamb];[0:a][1:a][2:a][3:a][4:a][tamb]amix=inputs=6:dropout_transition=0:normalize=0,volume=0.9,aecho=0.8:0.7:100:0.3,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
      {
        id: 'seed-bgm-10',
        filename: 'dramatic_trailer.mp3',
        name: 'Dramatic Hybrid Trailer',
        duration: 30,
        category: 'Dramatic',
        synthCmd: `ffmpeg -y -f lavfi -i "sine=f=43.65:d=30" -f lavfi -i "sine=f=87.31:d=30" -f lavfi -i "sine=f=130.81:d=30" -f lavfi -i "sine=f=174.61:d=30" -f lavfi -i "anoisesrc=d=30:c=white:a=0.15" -filter_complex "[4:a]lowpass=f=250,tremolo=f=2.25:d=0.95[impact];[0:a][1:a][2:a][3:a][impact]amix=inputs=5:dropout_transition=0:normalize=0,aecho=0.85:0.75:180:0.4,loudnorm=I=-14:TP=-0.5:LRA=7" -t 30 -c:a mp3 -b:a 192k`,
      },
    ];

    for (const bgm of musicDefs) {
      const bgmPath = path.join(SEEDS_DIR, bgm.filename);
      if (!fs.existsSync(bgmPath)) {
        try {
          const fullCmd = bgm.synthCmd.replace(/" -t 30 -c:a mp3/, `" "${bgmPath}" -t 30 -c:a mp3`).replace(/" -filter_complex/, `" -filter_complex`).replace(/"\s*$/, ` "${bgmPath}"`);
          await execAsync(`${bgm.synthCmd} "${bgmPath}"`);
        } catch (e: any) {
          // If specific syntax needed, simple fallback
          try {
            await execAsync(`ffmpeg -y -f lavfi -i "sine=f=220:d=30" -t 30 -c:a mp3 -b:a 192k "${bgmPath}"`);
          } catch {}
        }
      }

      const audioItem: MediaItem = {
        id: bgm.id,
        name: bgm.name,
        originalName: bgm.filename,
        type: 'audio',
        mimeType: 'audio/mp3',
        size: fs.existsSync(bgmPath) ? fs.statSync(bgmPath).size : 256000,
        duration: 30,
        width: 0,
        height: 0,
        fps: 0,
        filePath: bgmPath,
        url: `/seeds/${bgm.filename}`,
        thumbnailUrl: '',
        createdAt: new Date().toISOString(),
        aspectRatio: 'audio',
      };

      if (!seededItems.some((m) => m.id === audioItem.id)) {
        seededItems.push(audioItem);
      }
    }

    fs.writeFileSync(MEDIA_FILE, JSON.stringify(seededItems, null, 2));

    // Seed an initial demo project if projects.json does not exist
    if (!fs.existsSync(PROJECTS_FILE)) {
      const demoProject = {
        id: 'demo-project-1',
        title: 'Cinematic Reel 2026',
        description: 'Auto-edited montage created with AuraVideo AI',
        aspectRatio: '16:9',
        resolution: '1080p',
        fps: 30,
        duration: 18,
        thumbnailUrl: `/thumbnails/seed-clip-1.jpg`,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date().toISOString(),
        tracks: [
          {
            id: 'track-video-1',
            type: 'video',
            name: 'Main Video',
            clips: [
              {
                id: 'clip-1',
                mediaId: 'seed-clip-1',
                name: 'Cyberpunk Neon City',
                url: '/seeds/cyberpunk_neon_city.mp4',
                start: 0,
                duration: 6,
                trimStart: 0,
                trimEnd: 6,
                speed: 1,
                volume: 1,
                filter: 'cinematic',
                transition: { type: 'dissolve', duration: 0.8 },
              },
              {
                id: 'clip-2',
                mediaId: 'seed-clip-2',
                name: 'Nature Drone Mountains',
                url: '/seeds/nature_drone_mountains.mp4',
                start: 5.2,
                duration: 7,
                trimStart: 1,
                trimEnd: 8,
                speed: 1,
                volume: 1,
                filter: 'vibrant',
                transition: { type: 'fade', duration: 0.8 },
              },
              {
                id: 'clip-3',
                mediaId: 'seed-clip-3',
                name: 'Urban Street Vlog',
                url: '/seeds/urban_street_vlog.mp4',
                start: 11.4,
                duration: 6.6,
                trimStart: 0,
                trimEnd: 6.6,
                speed: 1,
                volume: 1,
                filter: 'warm',
                transition: { type: 'none', duration: 0 },
              },
            ],
          },
          {
            id: 'track-text-1',
            type: 'text',
            name: 'Titles & Captions',
            clips: [
              {
                id: 'text-1',
                text: 'AURA CINEMATIC CUT',
                start: 0.5,
                duration: 3.5,
                style: {
                  fontSize: 48,
                  fontWeight: 'bold',
                  fontFamily: 'Plus Jakarta Sans',
                  color: '#ffffff',
                  position: 'center',
                  animation: 'pop',
                },
              },
              {
                id: 'text-2',
                text: 'Shot on 8K Full Frame',
                start: 5.5,
                duration: 3.0,
                style: {
                  fontSize: 28,
                  fontWeight: 'medium',
                  fontFamily: 'Plus Jakarta Sans',
                  color: '#94a3b8',
                  position: 'bottom',
                  animation: 'fade',
                },
              },
            ],
          },
          {
            id: 'track-audio-1',
            type: 'audio',
            name: 'Background Music',
            clips: [
              {
                id: 'audio-1',
                mediaId: 'seed-bgm-1',
                name: 'Cinematic Horizon',
                url: '/seeds/cinematic_horizon.mp3',
                start: 0,
                duration: 18,
                trimStart: 0,
                volume: 0.45,
                fadeIn: 1.0,
                fadeOut: 1.5,
              },
            ],
          },
        ],
      };

      fs.writeFileSync(PROJECTS_FILE, JSON.stringify([demoProject], null, 2));
    }
  }
}
