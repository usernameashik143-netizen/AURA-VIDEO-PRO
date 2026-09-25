import path from 'path';
import fs from 'fs';

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
export const HOST = process.env.HOST || '0.0.0.0';

export const BASE_DIR = path.resolve(__dirname, '..');
export const CLIENT_DIST_DIR = process.env.CLIENT_DIST_DIR
  ? path.resolve(process.env.CLIENT_DIST_DIR)
  : path.resolve(BASE_DIR, '../client/dist');
export const STORAGE_DIR = path.join(BASE_DIR, 'storage');
export const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
export const THUMBNAILS_DIR = path.join(STORAGE_DIR, 'thumbnails');
export const EXPORTS_DIR = path.join(STORAGE_DIR, 'exports');
export const SEEDS_DIR = path.join(STORAGE_DIR, 'seeds');
export const PROJECTS_FILE = path.join(STORAGE_DIR, 'projects.json');
export const MEDIA_FILE = path.join(STORAGE_DIR, 'media.json');

// Ensure directories exist
[STORAGE_DIR, UPLOADS_DIR, THUMBNAILS_DIR, EXPORTS_DIR, SEEDS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
