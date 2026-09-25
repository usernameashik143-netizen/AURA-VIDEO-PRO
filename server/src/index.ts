import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PORT, HOST, CLIENT_DIST_DIR, UPLOADS_DIR, THUMBNAILS_DIR, EXPORTS_DIR, SEEDS_DIR } from './config.js';
import mediaRoutes from './routes/media.js';
import aiRoutes from './routes/ai.js';
import projectsRoutes from './routes/projects.js';
import templatesRoutes from './routes/templates.js';
import renderRoutes from './routes/render.js';
import audioRoutes from './routes/audio.js';
import { SeedService } from './services/seedService.js';

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file hosting
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/thumbnails', express.static(THUMBNAILS_DIR));
app.use('/exports', express.static(EXPORTS_DIR));
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

// Production frontend serving (SPA fallback)
if (fs.existsSync(CLIENT_DIST_DIR)) {
  console.log(`📦 Serving production frontend from ${CLIENT_DIST_DIR}`);
  app.use(express.static(CLIENT_DIST_DIR));
  app.get('*', (req, res) => {
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
