import { Router } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { PROJECTS_FILE } from '../config.js';
import { getOrCreateSessionId } from '../services/sessionService.js';

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
 * GET /api/projects - list projects belonging to current session (plus demo project)
 */
router.get('/', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const projects = getProjects();
  const visible = projects.filter((p) => p.id === 'demo-project-1' || (p.userId && p.userId === sessionId));
  res.json({ success: true, data: visible });
});

/**
 * GET /api/projects/:id
 */
router.get('/:id', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const { id } = req.params;
  const projects = getProjects();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  if (project.id !== 'demo-project-1' && project.userId && project.userId !== sessionId) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  res.json({ success: true, data: project });
});

/**
 * POST /api/projects - create new project tagged with current session
 */
router.post('/', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
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
    userId: sessionId,
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
 * PUT /api/projects/:id - update project (enforces ownership)
 */
router.put('/:id', (req, res) => {
  const sessionId = getOrCreateSessionId(req, res);
  const { id } = req.params;
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const existing = projects[index];
  if (existing.id !== 'demo-project-1' && existing.userId && existing.userId !== sessionId) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const updated = {
    ...existing,
    ...req.body,
    id, // protect id
    userId: existing.userId || sessionId,
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
  const sessionId = getOrCreateSessionId(req, res);
  const { id } = req.params;
  const projects = getProjects();
  const original = projects.find((p) => p.id === id);

  if (!original) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  if (original.id !== 'demo-project-1' && original.userId && original.userId !== sessionId) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const copy = {
    ...JSON.parse(JSON.stringify(original)),
    id: `proj-${uuidv4().slice(0, 8)}`,
    userId: sessionId,
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
  const sessionId = getOrCreateSessionId(req, res);
  const { id } = req.params;
  const projects = getProjects();
  const target = projects.find((p) => p.id === id);

  if (!target) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  if (target.id === 'demo-project-1') {
    return res.status(403).json({ success: false, error: 'Cannot delete default demo project' });
  }

  if (target.userId && target.userId !== sessionId) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const filtered = projects.filter((p) => p.id !== id);
  saveProjects(filtered);
  res.json({ success: true, message: 'Project deleted' });
});

export default router;
