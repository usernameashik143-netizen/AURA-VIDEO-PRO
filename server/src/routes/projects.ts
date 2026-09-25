import { Router } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { PROJECTS_FILE } from '../config.js';

const router = Router();

function getProjects(): any[] {
  if (!fs.existsSync(PROJECTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveProjects(projects: any[]): void {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

/**
 * GET /api/projects - list all projects
 */
router.get('/', (req, res) => {
  const projects = getProjects();
  res.json({ success: true, data: projects });
});

/**
 * GET /api/projects/:id
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const projects = getProjects();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  res.json({ success: true, data: project });
});

/**
 * POST /api/projects - create new project
 */
router.post('/', (req, res) => {
  const {
    title = 'Untitled Project',
    aspectRatio = '16:9',
    resolution = '1080p',
    fps = 30,
    tracks = [],
    duration = 0,
    thumbnailUrl = '',
  } = req.body;

  const projects = getProjects();
  const newProject = {
    id: `proj-${uuidv4().slice(0, 8)}`,
    title,
    aspectRatio,
    resolution,
    fps,
    duration,
    thumbnailUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tracks: tracks.length > 0 ? tracks : [
      { id: `track-video-${Date.now()}`, type: 'video', name: 'Main Video', clips: [] },
      { id: `track-text-${Date.now()}`, type: 'text', name: 'Titles & Captions', clips: [] },
      { id: `track-audio-${Date.now()}`, type: 'audio', name: 'Background Music', clips: [] },
    ],
  };

  projects.unshift(newProject);
  saveProjects(projects);

  res.json({ success: true, data: newProject });
});

/**
 * PUT /api/projects/:id - update project
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const updated = {
    ...projects[index],
    ...req.body,
    id, // protect id
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  saveProjects(projects);

  res.json({ success: true, data: updated });
});

/**
 * POST /api/projects/:id/duplicate
 */
router.post('/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const projects = getProjects();
  const original = projects.find((p) => p.id === id);

  if (!original) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const copy = {
    ...JSON.parse(JSON.stringify(original)),
    id: `proj-${uuidv4().slice(0, 8)}`,
    title: `${original.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  projects.unshift(copy);
  saveProjects(projects);

  res.json({ success: true, data: copy });
});

/**
 * DELETE /api/projects/:id
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);

  if (projects.length === filtered.length) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  saveProjects(filtered);
  res.json({ success: true, message: 'Project deleted' });
});

export default router;
