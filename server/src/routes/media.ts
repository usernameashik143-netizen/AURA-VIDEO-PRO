import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UPLOADS_DIR, THUMBNAILS_DIR, MEDIA_FILE } from '../config.js';
import { FFmpegService } from '../services/ffmpegService.js';
import { MediaItem } from '../services/seedService.js';
import { getOrCreateSessionId } from '../services/sessionService.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = uuidv4();
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB per file
});

export function getMediaItems(): MediaItem[] {
  if (!fs.existsSync(MEDIA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveMediaItems(items: MediaItem[]): void {
  fs.writeFileSync(MEDIA_FILE, JSON.stringify(items, null, 2));
}

/**
 * GET /api/media - list media items belonging to current session (plus public seeds)
 */
router.get('/', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const items = getMediaItems();
  const visible = items.filter((i) => {
    if (i.isSeed || i.id.startsWith('seed-')) return true;
    return i.userId && i.userId === sessionId;
  });
  res.json({ success: true, data: visible });
});

/**
 * POST /api/media/upload or /api/upload - upload multiple files tagged with current session
 */
router.post(['/', '/upload'], upload.array('files', 15), async (req, res) => {
  try {
    const sessionId = getOrCreateSessionId(req, res);
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const currentItems = getMediaItems();
    const newItems: MediaItem[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext);
      const isAudio = ['.mp3', '.wav', '.ogg', '.aac', '.m4a'].includes(ext);
      const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);

      const type: 'video' | 'audio' | 'image' = isVideo ? 'video' : isAudio ? 'audio' : 'image';
      const fileId = path.basename(file.filename, ext);
      const filePath = file.path;
      const thumbFilename = `${fileId}.jpg`;
      const thumbPath = path.join(THUMBNAILS_DIR, thumbFilename);

      let probeResult = {
        duration: 0,
        width: 1920,
        height: 1080,
        fps: 30,
        isPortrait: false,
      };

      if (isVideo) {
        probeResult = await FFmpegService.probeMedia(filePath);
        try {
          await FFmpegService.generateThumbnail(filePath, thumbPath, Math.min(1, probeResult.duration / 2));
        } catch (e) {
          console.warn('Thumbnail generation warning:', e);
        }
      } else if (isAudio) {
        const audioProbe = await FFmpegService.probeMedia(filePath);
        probeResult.duration = audioProbe.duration || 30;
      }

      const item: MediaItem = {
        id: fileId,
        userId: sessionId,
        isSeed: false,
        name: path.basename(file.originalname, ext),
        originalName: file.originalname,
        type,
        mimeType: file.mimetype,
        size: file.size,
        duration: probeResult.duration,
        width: probeResult.width,
        height: probeResult.height,
        fps: probeResult.fps,
        filePath,
        url: `/uploads/${file.filename}`,
        thumbnailUrl: isVideo ? `/thumbnails/${thumbFilename}` : '',
        createdAt: new Date().toISOString(),
        aspectRatio: probeResult.isPortrait ? '9:16' : '16:9',
      };

      newItems.push(item);
      currentItems.unshift(item);
    }

    saveMediaItems(currentItems);
    res.json({ success: true, uploaded: newItems, total: newItems.length });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

/**
 * DELETE /api/media/:id - delete media (enforces ownership)
 */
router.delete('/:id', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const { id } = req.params;
  const items = getMediaItems();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ success: false, error: 'Media not found' });
  }

  if (item.isSeed || item.id.startsWith('seed-')) {
    return res.status(403).json({ success: false, error: 'Cannot delete default system media assets' });
  }

  if (item.userId && item.userId !== sessionId) {
    return res.status(404).json({ success: false, error: 'Media not found' });
  }

  // Delete actual file if in uploads
  if (fs.existsSync(item.filePath) && item.filePath.includes('uploads')) {
    try {
      fs.unlinkSync(item.filePath);
    } catch {}
  }
  if (item.thumbnailUrl) {
    const thumbPath = path.join(THUMBNAILS_DIR, path.basename(item.thumbnailUrl));
    if (fs.existsSync(thumbPath)) {
      try {
        fs.unlinkSync(thumbPath);
      } catch {}
    }
  }

  const filtered = items.filter((i) => i.id !== id);
  saveMediaItems(filtered);
  res.json({ success: true, message: 'Media removed' });
});

/**
 * PATCH /api/media/:id - rename (enforces ownership)
 */
router.patch('/:id', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const { id } = req.params;
  const { name } = req.body;
  const items = getMediaItems();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ success: false, error: 'Media not found' });
  }

  if (item.userId && item.userId !== sessionId) {
    return res.status(404).json({ success: false, error: 'Media not found' });
  }

  if (name) item.name = name;
  saveMediaItems(items);
  res.json({ success: true, data: item });
});

export default router;
