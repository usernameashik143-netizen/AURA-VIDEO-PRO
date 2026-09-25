import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { MEDIA_FILE } from '../config.js';
import { AIService } from '../services/aiService.js';
import { FFmpegService } from '../services/ffmpegService.js';
import { MediaItem } from '../services/seedService.js';

const router = Router();

function getMediaItems(): MediaItem[] {
  if (!fs.existsSync(MEDIA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * POST /api/ai/analyze - analyze clips for highlights and silence
 */
router.post('/analyze', async (req, res) => {
  try {
    const { mediaIds } = req.body;
    const allMedia = getMediaItems();
    const targetClips = allMedia.filter((m) => mediaIds?.includes(m.id));

    if (targetClips.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid clips provided' });
    }

    const analyses = [];
    for (const clip of targetClips) {
      const momentAnalysis = await FFmpegService.analyzeClipsMoments(clip.filePath, clip.duration || 6);
      analyses.push({
        mediaId: clip.id,
        name: clip.name,
        aspectRatio: clip.aspectRatio,
        ...momentAnalysis,
      });
    }

    res.json({
      success: true,
      data: {
        totalClips: targetClips.length,
        totalDuration: targetClips.reduce((acc, c) => acc + (c.duration || 0), 0),
        analyses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/auto-edit - generates full auto-edited timeline
 */
router.post('/auto-edit', (req, res) => {
  try {
    const {
      mediaIds = [],
      style = 'Auto Select',
      aspectRatio = '16:9',
      targetDuration = 30,
      musicCategory,
      selectedBgmId,
      muteOriginalAudio,
      bgmVolume,
    } = req.body;

    const allMedia = getMediaItems();
    const selectedClips = allMedia.filter((m) => mediaIds.includes(m.id) && m.type === 'video');

    if (selectedClips.length === 0) {
      return res.status(400).json({ success: false, error: 'Please select at least one video clip' });
    }

    const musicList = allMedia.filter((m) => m.type === 'audio');

    const generated = AIService.generateAutoEdit({
      clips: selectedClips,
      style,
      aspectRatio,
      targetDuration: parseInt(targetDuration, 10),
      musicCategory,
      musicList,
      selectedBgmId,
      muteOriginalAudio: !!muteOriginalAudio,
      bgmVolume: bgmVolume !== undefined ? parseFloat(bgmVolume) : undefined,
    });

    res.json({
      success: true,
      data: generated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/assistant - natural language editor command
 */
router.post('/assistant', (req, res) => {
  try {
    const { command, project } = req.body;
    if (!command) {
      return res.status(400).json({ success: false, error: 'Command required' });
    }
    if (!project) {
      return res.status(400).json({ success: false, error: 'Current project required' });
    }

    const result = AIService.processAssistantCommand(command, project);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/captions - speech detection and caption generation
 */
router.post('/captions', (req, res) => {
  try {
    const { duration = 20 } = req.body;
    const captions = AIService.generateCaptions(parseFloat(duration));
    res.json({ success: true, data: captions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/subtitles - generate downloadable SRT or VTT subtitle content
 */
router.post('/subtitles', (req, res) => {
  try {
    const { captions = [], format = 'srt' } = req.body;
    const content = AIService.generateSubtitleFile(captions, format);
    res.json({
      success: true,
      data: {
        format,
        content,
        filename: `subtitles.${format}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/music - get BGM tracks
 */
router.get('/music', (req, res) => {
  const allMedia = getMediaItems();
  const musicList = allMedia.filter((m) => m.type === 'audio');
  res.json({ success: true, data: musicList });
});

/**
 * GET /api/ai/background-removal/status - check segmentation engine status
 */
router.get('/background-removal/status', async (req, res) => {
  try {
    const { BackgroundRemovalService } = await import('../services/backgroundRemovalService.js');
    const status = await BackgroundRemovalService.checkStatus();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/background-removal - segment subject and apply replacement
 */
router.post('/background-removal', async (req, res) => {
  try {
    const {
      mediaId,
      filePath,
      mode = 'transparent',
      color = '#000000',
      bgImagePath,
      feather = 5,
      iterations = 5,
      scale = 1.0,
      posX = 0,
      posY = 0,
      bgOpacity = 1.0,
      maxVideoDuration = 5.0,
    } = req.body;

    let targetPath = filePath;
    let originalName = 'Subject';

    if (mediaId) {
      const allMedia = getMediaItems();
      const found = allMedia.find((m) => m.id === mediaId);
      if (found) {
        targetPath = found.filePath;
        originalName = found.name;
      }
    }

    if (targetPath && !fs.existsSync(targetPath)) {
      const candidates = [
        path.resolve(process.cwd(), targetPath),
        path.resolve(process.cwd(), '..', targetPath),
        path.resolve(process.cwd(), 'client/public', targetPath.replace(/^\//, '')),
        path.resolve(process.cwd(), '../client/public', targetPath.replace(/^\//, '')),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          targetPath = c;
          break;
        }
      }
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      return res.status(400).json({ success: false, error: 'Valid mediaId or existing filePath is required' });
    }

    const { BackgroundRemovalService } = await import('../services/backgroundRemovalService.js');
    const result = await BackgroundRemovalService.process({
      inputPath: targetPath,
      mode,
      color,
      bgImagePath,
      feather: parseInt(feather, 10) || 5,
      iterations: parseInt(iterations, 10) || 5,
      scale: parseFloat(scale) || 1.0,
      posX: parseInt(posX, 10) || 0,
      posY: parseInt(posY, 10) || 0,
      bgOpacity: bgOpacity !== undefined ? parseFloat(bgOpacity) : 1.0,
      maxVideoDuration: parseFloat(maxVideoDuration) || 5.0,
      originalName,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/speech-to-text/status - check speech recognition availability honestly
 */
router.get('/speech-to-text/status', (req, res) => {
  const hasWhisperKey = !!process.env.OPENAI_API_KEY || !!process.env.WHISPER_API_KEY;
  res.json({
    success: true,
    data: {
      available: hasWhisperKey,
      engine: hasWhisperKey ? 'OpenAI Whisper API' : 'Manual Timed Captions (Whisper API key not configured)',
      message: hasWhisperKey
        ? 'Speech recognition is ready for automatic caption transcription.'
        : 'Automated speech recognition requires an OpenAI Whisper API key or local whisper.cpp model. You can freely edit, style, time, and import/export manual captions and subtitles without a key.',
    },
  });
});

export default router;

