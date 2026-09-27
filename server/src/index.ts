import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PORT, HOST, CLIENT_DIST_DIR, UPLOADS_DIR, THUMBNAILS_DIR, EXPORTS_DIR, SEEDS_DIR, MEDIA_FILE } from './config.js';
import mediaRoutes from './routes/media.js';
import aiRoutes from './routes/ai.js';
import projectsRoutes from './routes/projects.js';
import templatesRoutes from './routes/templates.js';
import renderRoutes, { activeJobs } from './routes/render.js';
import audioRoutes from './routes/audio.js';
import { SeedService, MediaItem } from './services/seedService.js';
import { getOrCreateSessionId } from './services/sessionService.js';

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session Middleware: ensures every visitor receives and maintains an authoritative HttpOnly session cookie
app.use((req, res, next) => {
  getOrCreateSessionId(req, res);
  next();
});

function findMediaByFilename(filename: string): MediaItem | undefined {
  if (!fs.existsSync(MEDIA_FILE)) return undefined;
  try {
    const items: MediaItem[] = JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));
    return items.find((i) => {
      const u = i.url ? path.basename(i.url) : '';
      const t = i.thumbnailUrl ? path.basename(i.thumbnailUrl) : '';
      const f = i.filePath ? path.basename(i.filePath) : '';
      return u === filename || t === filename || f === filename || i.id === filename.replace(/\.[^.]+$/, '');
    });
  } catch {
    return undefined;
  }
}

// Protected Uploads Serving
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const fullPath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }

  const media = findMediaByFilename(filename);
  const sessionId = getOrCreateSessionId(req, res);

  if (media && media.userId && media.userId !== sessionId && !media.isSeed && !media.id.startsWith('seed-')) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }

  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.sendFile(fullPath);
});

// Protected Thumbnails Serving
app.get('/thumbnails/:filename', (req, res) => {
  const { filename } = req.params;

  const clientThumb = path.join(CLIENT_DIST_DIR, 'thumbnails', filename);
  if (fs.existsSync(clientThumb)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(clientThumb);
  }

  const fullPath = path.join(THUMBNAILS_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }

  const media = findMediaByFilename(filename);
  const sessionId = getOrCreateSessionId(req, res);

  if (media && media.userId && media.userId !== sessionId && !media.isSeed && !media.id.startsWith('seed-')) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }

  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.sendFile(fullPath);
});

// Protected Exports Serving
app.get('/exports/:filename', (req, res) => {
  const { filename } = req.params;
  const fullPath = path.join(EXPORTS_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }

  const sessionId = getOrCreateSessionId(req, res);
  const job = Array.from(activeJobs.values()).find((j) => j.outputFilename === filename);
  if (job && job.userId && job.userId !== sessionId) {
    return res.status(404).json({ success: false, error: 'Asset not found' });
  }

  res.setHeader('Cache-Control', 'private, no-cache');
  res.sendFile(fullPath);
});

// Public Seeds Serving
app.use('/seeds', express.static(SEEDS_DIR));

// API Routes
app.use('/api/media', mediaRoutes);
app.use('/api/upload', mediaRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/render', renderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'Aura Video Pro Backend',
    timestamp: new Date().toISOString(),
  });
});

// JSON fallback for any unmatched /api routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Prevent SPA fallback from returning HTML for missing static media assets
app.all(['/uploads/*', '/thumbnails/*', '/exports/*', '/seeds/*'], (req, res) => {
  res.status(404).json({ success: false, error: `Asset not found: ${req.originalUrl}` });
});

// Production frontend serving (SPA fallback) with anti-caching for HTML entry point
if (fs.existsSync(CLIENT_DIST_DIR)) {
  console.log(`📦 Serving production frontend from ${CLIENT_DIST_DIR}`);
  app.use(express.static(CLIENT_DIST_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
  });
}

// Global JSON error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// Boot and seed
async function start() {
  try {
    await SeedService.seedInitialMedia();
  } catch (err) {
    console.warn('Initial seeding encountered non-fatal note:', err);
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Aura Video Pro Server listening on http://${HOST}:${PORT}`);
  });
}

start();
