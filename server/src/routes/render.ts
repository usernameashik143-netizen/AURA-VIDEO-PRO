import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { EXPORTS_DIR, MEDIA_FILE, SEEDS_DIR, UPLOADS_DIR } from '../config.js';
import { FFmpegService, RenderClipItem, RenderAudioItem } from '../services/ffmpegService.js';
import { MediaItem } from '../services/seedService.js';
import { AudioService } from '../services/audioService.js';

const router = Router();

interface RenderJob {
  id: string;
  projectId?: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  stage: string;
  progress: number;
  error?: string;
  outputFilename: string;
  outputFilePath: string;
  downloadUrl?: string;
  previewUrl?: string;
  fileSize?: number;
  duration?: number;
  startedAt: string;
  completedAt?: string;
}

const activeJobs = new Map<string, RenderJob>();

function getMediaMap(): Map<string, MediaItem> {
  const map = new Map<string, MediaItem>();
  if (fs.existsSync(MEDIA_FILE)) {
    try {
      const items: MediaItem[] = JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
      items.forEach((item) => map.set(item.id, item));
    } catch {}
  }
  return map;
}

/**
 * POST /api/render - initiate rendering job
 */
router.post(['/', '/start'], async (req, res) => {
  try {
    let {
      projectId,
      title = 'Exported_Video',
      clips = [],
      audioTracks = [],
      textClips = [],
      captions = [],
      aspectRatio = '16:9',
      resolution = '1080p',
      fps = 30,
      format = 'mp4',
      quality = 'high',
      canvasMode = 'fit',
      backgroundColor = 'black',
      autoDucking = false,
      duckingAmount = 0.5,
    } = req.body;

    // Support direct project & config object
    if (req.body.project) {
      const proj = req.body.project;
      projectId = proj.id || projectId;
      title = proj.title || title;
      aspectRatio = proj.aspectRatio || req.body.config?.aspectRatio || aspectRatio;
      if (req.body.config) {
        resolution = req.body.config.resolution || resolution;
        fps = req.body.config.fps || fps;
        format = req.body.config.format || format;
        quality = req.body.config.quality || quality;
        canvasMode = req.body.config.canvasMode || canvasMode;
        backgroundColor = req.body.config.backgroundColor || backgroundColor;
      }
      if (Array.isArray(proj.tracks)) {
        const videoTracks = proj.tracks.filter((t: any) => t.type === 'video');
        const overlayTracks = proj.tracks.filter((t: any) => t.type === 'sticker' || (t.name && t.name.toLowerCase().includes('overlay')));
        const audioTrackList = proj.tracks.filter((t: any) => t.type === 'audio');
        const textTrackList = proj.tracks.filter((t: any) => t.type === 'text');

        // 1. Primary Video Track
        if (videoTracks.length > 0 && Array.isArray(videoTracks[0].clips) && videoTracks[0].clips.length > 0) {
          clips = videoTracks[0].clips;
        }

        // 2. Secondary Video Tracks & Overlays
        const secondaryVideoClips: any[] = [];
        for (let i = 1; i < videoTracks.length; i++) {
          if (Array.isArray(videoTracks[i].clips)) {
            secondaryVideoClips.push(...videoTracks[i].clips);
          }
        }
        overlayTracks.forEach((ot: any) => {
          if (Array.isArray(ot.clips)) {
            secondaryVideoClips.push(...ot.clips);
          }
        });
        if (secondaryVideoClips.length > 0) {
          req.body.overlayClips = secondaryVideoClips;
        }

        // 3. All Audio Tracks
        const combinedAudio: any[] = [];
        audioTrackList.forEach((at: any) => {
          if (Array.isArray(at.clips)) {
            at.clips.forEach((ac: any) => {
              combinedAudio.push({
                ...ac,
                volume: (ac.volume !== undefined ? ac.volume : 1) * (at.volume !== undefined ? at.volume : 1),
                isMuted: ac.isMuted || at.isMuted,
              });
            });
          }
        });
        if (combinedAudio.length > 0) audioTracks = combinedAudio;

        // 4. All Text Tracks
        const combinedText: any[] = [];
        textTrackList.forEach((tt: any) => {
          if (Array.isArray(tt.clips)) combinedText.push(...tt.clips);
        });
        if (combinedText.length > 0) textClips = combinedText;
      }
    }

    const mediaMap = getMediaMap();
    const jobId = `job-${uuidv4().slice(0, 8)}`;
    const ext = format === 'webm' ? 'webm' : 'mp4';
    const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outputFilename = `${cleanTitle}_${jobId}.${ext}`;
    const outputFilePath = path.join(EXPORTS_DIR, outputFilename);

    // Robust media path resolver
    const resolveMediaPath = (item: { filePath?: string; url?: string; mediaId?: string; src?: string; id?: string; name?: string }): string | undefined => {
      const candidatePath = item.filePath || (item as any).path;
      if (candidatePath && fs.existsSync(candidatePath)) {
        return candidatePath;
      }
      if (item.mediaId) {
        const m = mediaMap.get(item.mediaId);
        if (m && fs.existsSync(m.filePath)) return m.filePath;
      }
      const rawUrl = item.url || item.src;
      if (rawUrl) {
        // Match /seeds/ or /storage/seeds/
        const seedMatch = rawUrl.match(/(?:storage\/seeds\/|seeds\/)([^/?#]+)/);
        if (seedMatch) {
          const p = path.join(SEEDS_DIR, seedMatch[1]);
          if (fs.existsSync(p)) return p;
        }
        // Match /uploads/ or /storage/uploads/
        const uploadMatch = rawUrl.match(/(?:storage\/uploads\/|uploads\/)([^/?#]+)/);
        if (uploadMatch) {
          const p = path.join(UPLOADS_DIR, uploadMatch[1]);
          if (fs.existsSync(p)) return p;
        }
        // Direct seeds check
        if (rawUrl.startsWith('/seeds/')) {
          const fname = rawUrl.replace(/^\/seeds\//, '');
          const p = path.join(SEEDS_DIR, fname);
          if (fs.existsSync(p)) return p;
        }
        // Direct uploads check
        if (rawUrl.startsWith('/uploads/')) {
          const fname = rawUrl.replace(/^\/uploads\//, '');
          const p = path.join(UPLOADS_DIR, fname);
          if (fs.existsSync(p)) return p;
        }
        // Match by URL in mediaMap
        const m = Array.from(mediaMap.values()).find((media) => media.url === rawUrl);
        if (m && fs.existsSync(m.filePath)) return m.filePath;
      }
      // Check if item.id matches an item in the audio library catalog
      if (item.id) {
        const catItem = AudioService.getLibrary().find((c) => c.id === item.id);
        if (catItem && catItem.url) {
          const seedMatch = catItem.url.match(/(?:storage\/seeds\/|seeds\/)([^/?#]+)/);
          if (seedMatch) {
            const p = path.join(SEEDS_DIR, seedMatch[1]);
            if (fs.existsSync(p)) return p;
          }
        }
      }
      // Check if item.name matches any seed mp3 file
      if (item.name) {
        const cleanName = item.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (fs.existsSync(SEEDS_DIR)) {
          const seedFiles = fs.readdirSync(SEEDS_DIR);
          const match = seedFiles.find(
            (f) =>
              f.toLowerCase().includes(cleanName) ||
              cleanName.includes(f.toLowerCase().replace('.mp3', ''))
          );
          if (match) {
            return path.join(SEEDS_DIR, match);
          }
        }
      }
      return undefined;
    };

    // Resolve filePaths for clips
    const resolvedClips: RenderClipItem[] = [];
    for (const clip of clips) {
      const resolvedPath = resolveMediaPath(clip);

      if (resolvedPath && fs.existsSync(resolvedPath)) {
        resolvedClips.push({
          id: clip.id,
          filePath: resolvedPath,
          start: clip.start || 0,
          trimStart: clip.trimStart || 0,
          trimEnd: clip.trimEnd || (clip.duration ? (clip.trimStart || 0) + clip.duration : 5),
          duration: clip.duration || 5,
          speed: clip.speed || 1,
          volume: clip.volume !== undefined ? clip.volume : 1,
          isMuted: clip.isMuted,
          filter: clip.filter,
          filterIntensity: clip.filterIntensity,
          transition: clip.transition,
          crop: clip.crop,
          positionX: clip.positionX,
          positionY: clip.positionY,
          scale: clip.scale,
          rotation: clip.rotation,
          flipH: clip.flipH,
          flipV: clip.flipV,
          opacity: clip.opacity,
          removeBackground: clip.removeBackground,
          bgKeyColor: clip.bgKeyColor,
          bgReplaceColor: clip.bgReplaceColor,
          adjustments: clip.adjustments,
          effects: clip.effects,
          noiseReduction: clip.noiseReduction,
          voiceEnhance: clip.voiceEnhance,
          normalize: clip.normalize,
        });
      }
    }

    // Ensure clips are ordered chronologically by timeline start
    resolvedClips.sort((a, b) => (a.start || 0) - (b.start || 0));

    if (resolvedClips.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid video clip sources could be located on server for rendering.',
      });
    }

    // Resolve audio tracks
    const resolvedAudio: RenderAudioItem[] = [];
    for (const audio of audioTracks) {
      const resolvedPath = resolveMediaPath(audio);

      if (resolvedPath && fs.existsSync(resolvedPath)) {
        resolvedAudio.push({
          id: audio.id,
          filePath: resolvedPath,
          start: audio.start || 0,
          trimStart: audio.trimStart || 0,
          duration: audio.duration || 30,
          volume: audio.isMuted ? 0 : (audio.volume !== undefined ? audio.volume : 0.8),
          isMuted: audio.isMuted,
          fadeIn: audio.fadeIn || 0.5,
          fadeOut: audio.fadeOut || 1.0,
          normalize: audio.normalize,
        });
      }
    }

    // Resolve secondary overlay clips
    const rawOverlays = req.body.overlayClips || [];
    const resolvedOverlays: RenderClipItem[] = [];
    for (const ov of rawOverlays) {
      const resolvedPath = resolveMediaPath(ov);
      if (resolvedPath && fs.existsSync(resolvedPath)) {
        resolvedOverlays.push({
          id: ov.id,
          filePath: resolvedPath,
          start: ov.start || 0,
          trimStart: ov.trimStart || 0,
          trimEnd: ov.trimEnd || (ov.duration ? (ov.trimStart || 0) + ov.duration : 5),
          duration: ov.duration || 5,
          positionX: ov.positionX,
          positionY: ov.positionY,
          scale: ov.scale,
          opacity: ov.opacity,
          rotation: ov.rotation,
        });
      }
    }

    // Diagnostic logging
    console.log(`[RENDER PAYLOAD] Job ID: ${jobId}, Title: ${title}`);
    console.log(`[RENDER PAYLOAD] Clips count: ${resolvedClips.length}, Overlays count: ${resolvedOverlays.length}, Audio tracks count: ${resolvedAudio.length}`);
    console.log(`[RENDER PAYLOAD] Transitions:`, resolvedClips.map((c) => ({ id: c.id, transition: c.transition?.type || 'none', dur: c.transition?.duration })));
    console.log(`[RENDER PAYLOAD] Filters/Effects:`, resolvedClips.map((c) => ({ id: c.id, filter: c.filter, effects: c.effects?.map((e) => e.type) })));
    resolvedAudio.forEach((a) => {
      console.log(`[BGM] requested track: ${a.id}, resolved file: ${a.filePath}, duration: ${a.duration}s, volume: ${a.volume}, start: ${a.start}s, trim: ${a.trimStart}s`);
    });

    const job: RenderJob = {
      id: jobId,
      projectId,
      status: 'rendering',
      stage: 'Initializing rendering pipeline',
      progress: 5,
      outputFilename,
      outputFilePath,
      startedAt: new Date().toISOString(),
    };

    activeJobs.set(jobId, job);

    // Run rendering asynchronously in background
    FFmpegService.renderVideo({
      jobId,
      clips: resolvedClips,
      overlayClips: resolvedOverlays,
      audioTracks: resolvedAudio,
      textClips,
      captions,
      canvasMode,
      backgroundColor,
      autoDucking,
      duckingAmount,
      aspectRatio,
      resolution,
      fps,
      format,
      quality,
      outputPath: outputFilePath,
      onProgress: (prog) => {
        job.stage = prog.stage;
        job.progress = prog.percent;
      },
    })
      .then(() => {
        job.status = 'completed';
        job.progress = 100;
        job.stage = 'Render completed successfully';
        job.downloadUrl = `/exports/${outputFilename}`;
        job.previewUrl = `/exports/${outputFilename}`;
        job.completedAt = new Date().toISOString();
        if (fs.existsSync(outputFilePath)) {
          job.fileSize = fs.statSync(outputFilePath).size;
        }
      })
      .catch((err) => {
        console.error(`Render job ${jobId} failed:`, err);
        job.status = 'failed';
        job.error = err.message || 'Render pipeline failed';
      });

    res.json({
      success: true,
      data: {
        jobId,
        status: job.status,
        progress: job.progress,
        stage: job.stage,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/render/status/:jobId or /api/render/:jobId - check progress
 */
router.get(['/status/:jobId', '/job/:jobId', '/:jobId'], (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Render job not found' });
  }

  res.json({ success: true, data: job });
});

/**
 * GET /api/render/download/:jobId
 */
router.get('/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job || !fs.existsSync(job.outputFilePath)) {
    return res.status(404).json({ success: false, error: 'Render output file not found' });
  }

  res.download(job.outputFilePath, job.outputFilename);
});

export default router;
