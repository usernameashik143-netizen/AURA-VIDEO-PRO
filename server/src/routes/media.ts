import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UPLOADS_DIR, THUMBNAILS_DIR, MEDIA_FILE } from '../config.js';
import { FFmpegService } from '../services/ffmpegService.js';
import { MediaItem } from '../services/seedService.js';

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

function getMediaItems(): MediaItem[] {
  if (!fs.existsSync(MEDIA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveMediaItems(items: MediaItem[]): void {
  fs.writeFileSync(MEDIA_FILE, JSON.stringify(items, null, 2));
}

/**
 * GET /api/media - list all media items
 */
router.get('/', (req, res) => {
  const items = getMediaItems();
  res.json({ success: true, data: items });
});

/**
 * POST /api/media/upload or /api/upload - upload multiple files
 */
router.post(['/', '/upload'], upload.array('files', 15), async (req, res) => {
  try {
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
    res.json({ success: true, uploaded: newItems, total: currentItems.length });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

/**
 * DELETE /api/media/:id
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const items = getMediaItems();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ success: false, error: 'Media not found' });
  }

  // Delete actual file if in uploads
  if (fs.existsSync(item.filePath) && item.filePath.includes('uploads')) {
    try {
      fs.unlinkSync(item.filePath);
    } catch {}
  }

  const filtered = items.filter((i) => i.id !== id);
  saveMediaItems(filtered);
  res.json({ success: true, message: 'Media removed' });
});

/**
 * PATCH /api/media/:id - rename
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const items = getMediaItems();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ success: false, error: 'Media not found' });
  }

  if (name) item.name = name;
  saveMediaItems(items);
  res.json({ success: true, data: item });
});

export default router;
