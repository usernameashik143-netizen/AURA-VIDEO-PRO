import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { EXPORTS_DIR, MEDIA_FILE, SEEDS_DIR, UPLOADS_DIR, PROJECTS_FILE } from '../config.js';
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

    // If clips is empty but projectId is provided, lookup stored project
    if (clips.length === 0 && !req.body.project && projectId && fs.existsSync(PROJECTS_FILE)) {
      try {
        const stored = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
        const found = stored.find((p: any) => p.id === projectId);
        if (found) {
          req.body.project = found;
        }
      } catch {}
    }

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
    const resolveMediaPath = (item: { filePath?: string; url?: string; mediaId?: string; src?: string; id?: string; name?: string; originalName?: string }): string | undefined => {
      if (!item) return undefined;
      const candidatePath = item.filePath || (item as any).path;
      if (candidatePath && fs.existsSync(candidatePath)) {
        return candidatePath;
      }
      if (candidatePath) {
        const base = path.basename(candidatePath);
        const inSeeds = path.join(SEEDS_DIR, base);
        if (fs.existsSync(inSeeds)) return inSeeds;
        const inUploads = path.join(UPLOADS_DIR, base);
        if (fs.existsSync(inUploads)) return inUploads;
      }
      if (item.mediaId) {
        const m = mediaMap.get(item.mediaId);
        if (m && fs.existsSync(m.filePath)) return m.filePath;
        if (m && m.filePath) {
          const base = path.basename(m.filePath);
          const inSeeds = path.join(SEEDS_DIR, base);
          if (fs.existsSync(inSeeds)) return inSeeds;
          const inUploads = path.join(UPLOADS_DIR, base);
          if (fs.existsSync(inUploads)) return inUploads;
        }
      }
      const rawUrl = item.url || item.src;
      if (rawUrl) {
        // Strip origin if full URL
        const cleanUrl = rawUrl.replace(/^https?:\/\/[^/]+/i, '');
        const seedMatch = cleanUrl.match(/(?:storage\/seeds\/|seeds\/)([^/?#]+)/i);
        if (seedMatch) {
          const p = path.join(SEEDS_DIR, seedMatch[1]);
          if (fs.existsSync(p)) return p;
        }
        const uploadMatch = cleanUrl.match(/(?:storage\/uploads\/|uploads\/)([^/?#]+)/i);
        if (uploadMatch) {
          const p = path.join(UPLOADS_DIR, uploadMatch[1]);
          if (fs.existsSync(p)) return p;
        }
        const urlBase = path.basename(cleanUrl);
        const inUploads = path.join(UPLOADS_DIR, urlBase);
        if (fs.existsSync(inUploads)) return inUploads;
        const inSeeds = path.join(SEEDS_DIR, urlBase);
        if (fs.existsSync(inSeeds)) return inSeeds;

        // Match by URL in mediaMap
        const m = Array.from(mediaMap.values()).find((media) => media.url === rawUrl || media.url === cleanUrl);
        if (m && fs.existsSync(m.filePath)) return m.filePath;
      }
      // Check if item.id matches an item in the audio library catalog
      if (item.id) {
        const catItem = AudioService.getLibrary().find((c) => c.id === item.id);
        if (catItem && catItem.url) {
          const seedMatch = catItem.url.match(/(?:storage\/seeds\/|seeds\/)([^/?#]+)/i);
          if (seedMatch) {
            const p = path.join(SEEDS_DIR, seedMatch[1]);
            if (fs.existsSync(p)) return p;
          }
        }
      }
      // Check if item.name or originalName matches any seed or upload file
      const searchName = (item.originalName || item.name || '').toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      if (searchName) {
        if (fs.existsSync(SEEDS_DIR)) {
          const seedFiles = fs.readdirSync(SEEDS_DIR);
          const match = seedFiles.find(
            (f) =>
              f.toLowerCase() === searchName ||
              f.toLowerCase().includes(searchName) ||
              searchName.includes(f.toLowerCase().replace(/\.[^.]+$/, ''))
          );
          if (match) return path.join(SEEDS_DIR, match);
        }
        if (fs.existsSync(UPLOADS_DIR)) {
          const uploadFiles = fs.readdirSync(UPLOADS_DIR);
          const match = uploadFiles.find(
            (f) =>
              f.toLowerCase() === searchName ||
              f.toLowerCase().includes(searchName) ||
              searchName.includes(f.toLowerCase().replace(/\.[^.]+$/, ''))
          );
          if (match) return path.join(UPLOADS_DIR, match);
        }
      }
      return undefined;
    };

    // Resolve filePaths for clips with deterministic normalization
    const resolvedClips: RenderClipItem[] = [];
    for (const clip of clips) {
      const resolvedPath = resolveMediaPath(clip);

      if (resolvedPath && fs.existsSync(resolvedPath)) {
        const rawTrimStart = typeof clip.trimStart === 'number' && !isNaN(clip.trimStart) ? Math.max(0, clip.trimStart) : 0;
        const rawDur = typeof clip.duration === 'number' && !isNaN(clip.duration) && clip.duration > 0 ? clip.duration : 5;
        let rawTrimEnd = typeof clip.trimEnd === 'number' && !isNaN(clip.trimEnd) ? clip.trimEnd : rawTrimStart + rawDur;
        if (rawTrimEnd <= rawTrimStart) rawTrimEnd = rawTrimStart + rawDur;

        const rawSpeed = typeof clip.speed === 'number' && !isNaN(clip.speed) && clip.speed > 0 ? Math.min(4.0, Math.max(0.25, clip.speed)) : 1;
        const rawVol = clip.isMuted ? 0 : (typeof clip.volume === 'number' && !isNaN(clip.volume) ? Math.max(0, clip.volume) : 1);

        resolvedClips.push({
          id: clip.id || `clip-${resolvedClips.length + 1}`,
          filePath: resolvedPath,
          start: typeof clip.start === 'number' && !isNaN(clip.start) ? Math.max(0, clip.start) : 0,
          trimStart: rawTrimStart,
          trimEnd: rawTrimEnd,
          duration: rawDur,
          speed: rawSpeed,
          volume: rawVol,
          isMuted: Boolean(clip.isMuted || rawVol <= 0.001),
          filter: clip.filter || 'none',
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

    // Resolve audio tracks (BGM) - only include active, positive volume, existing files
    const resolvedAudio: RenderAudioItem[] = [];
    for (const audio of audioTracks) {
      if (!audio || audio.isMuted) continue;
      const vol = typeof audio.volume === 'number' && !isNaN(audio.volume) ? audio.volume : 0.8;
      if (vol <= 0.001) continue;

      const resolvedPath = resolveMediaPath(audio);
      if (resolvedPath && fs.existsSync(resolvedPath)) {
        resolvedAudio.push({
          id: audio.id || `audio-${resolvedAudio.length + 1}`,
          filePath: resolvedPath,
          start: typeof audio.start === 'number' && !isNaN(audio.start) ? Math.max(0, audio.start) : 0,
          trimStart: typeof audio.trimStart === 'number' && !isNaN(audio.trimStart) ? Math.max(0, audio.trimStart) : 0,
          duration: typeof audio.duration === 'number' && !isNaN(audio.duration) && audio.duration > 0 ? audio.duration : 30,
          volume: vol,
          isMuted: false,
          fadeIn: typeof audio.fadeIn === 'number' && !isNaN(audio.fadeIn) ? Math.max(0, audio.fadeIn) : 0.5,
          fadeOut: typeof audio.fadeOut === 'number' && !isNaN(audio.fadeOut) ? Math.max(0, audio.fadeOut) : 1.0,
          normalize: Boolean(audio.normalize),
        });
      } else {
        console.warn(`[RENDER_WARNING] Audio track ${audio.id || audio.name || 'unnamed'} could not be resolved on disk, skipping BGM.`);
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

    // Structured logging for every render (Phase 1 requirement)
    const bgmActive = resolvedAudio.length > 0;
    const bgmPath = bgmActive ? resolvedAudio.map((a) => a.filePath).join(', ') : 'none';
    const transitionCount = resolvedClips.filter(
      (c, i) => i < resolvedClips.length - 1 && c.transition && c.transition.type && c.transition.type !== 'none'
    ).length;
    const filterStyles = resolvedClips.map((c) => c.filter || 'none').join(', ');

    console.log(`[RENDER_START]`);
    console.log(`jobId: ${jobId}`);
    console.log(`clip count: ${resolvedClips.length}`);
    console.log(`resolution: ${resolution}`);
    console.log(`fps: ${fps}`);
    console.log(`BGM enabled/disabled: ${bgmActive ? 'enabled' : 'disabled'}`);
    console.log(`BGM URL/path: ${bgmPath}`);
    console.log(`transition count: ${transitionCount}`);
    console.log(`filter/style: ${filterStyles}`);
    console.log(`output path: ${outputFilePath}`);

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
        console.error(`[RENDER_ERROR] Render job ${jobId} failed:`, err);
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
 * GET /api/render or /api/render/jobs - list all active and recent render jobs
 */
router.get(['/', '/jobs'], (req, res) => {
  const jobsList = Array.from(activeJobs.values()).map((j) => ({
    id: j.id,
    projectId: j.projectId,
    status: j.status,
    stage: j.stage,
    progress: j.progress,
    error: j.error,
    startedAt: j.startedAt,
    completedAt: j.completedAt,
    fileSize: j.fileSize,
    downloadUrl: j.downloadUrl,
  }));
  res.json({ success: true, count: jobsList.length, data: jobsList });
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
