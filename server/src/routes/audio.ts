import { Router } from 'express';
import { AudioService, AUDIO_CATEGORIES } from '../services/audioService.js';

const router = Router();

/**
 * GET /api/audio/categories
 */
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: AUDIO_CATEGORIES,
  });
});

/**
 * GET /api/audio/library
 * Query params: category, query
 */
router.get('/library', (req, res) => {
  try {
    const { category, query } = req.query;
    const items = AudioService.getLibrary(
      category as string | undefined,
      query as string | undefined
    );
    res.json({
      success: true,
      data: items,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/audio/beats - return beat timestamps for snapping and auto-sync
 */
router.post('/beats', (req, res) => {
  try {
    const { duration = 30, bpm = 120 } = req.body;
    const beats = AudioService.detectBeats(parseFloat(duration), parseInt(bpm, 10));
    res.json({
      success: true,
      data: {
        bpm,
        duration,
        beats,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/audio/waveform - generate normalized waveform peak array
 */
router.post('/waveform', (req, res) => {
  try {
    const { seed = 1, count = 60 } = req.body;
    const peaks = AudioService.getWaveformPeaks(parseInt(seed, 10), parseInt(count, 10));
    res.json({
      success: true,
      data: peaks,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
