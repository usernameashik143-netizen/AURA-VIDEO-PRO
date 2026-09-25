# AuraVideo AI — Next-Generation AI Video Editor

A complete, modern, production-quality AI Video Editor web application built with a **Pure Black + Liquid Glass + Matte Black** design system. The application combines the power and precision of professional multi-track video editing with an autonomous, beginner-friendly AI video generation pipeline.

---

## 🌟 Key Features

### 1. Pure Black + Liquid Glass Aesthetic
- **Visual Design**: Pure black (`#050507`) and matte dark finishes (`#09090e`, `#121218`) accented with fluid glassmorphism panels, specular border highlights (`rgba(255, 255, 255, 0.1)`), soft ambient shadows, and electric indigo & cyan glows.
- **Micro-Interactions**: Smooth hover effects, animated progress indicators, timeline scrubbers, and glass-reflection modals.
- **Consistent Design System**: Applied uniformly across Dashboard, AI Auto Edit, Video Editor, Templates, Media Library, My Projects, Export, Settings, Modals, and Toasts.
- **Full Responsiveness**: Sleek desktop left sidebar + compact bottom navigation for tablets and mobile devices.

### 2. Autonomous AI Auto Edit (Main Feature)
- **Multi-Clip Processing**: Upload raw video clips (drag & drop or file picker).
- **Intelligent Pipeline**:
  1. Clip Analysis & Face/Motion Salience Scoring.
  2. Silence & Redundant Take Detection & Pruning.
  3. Key Moment & Hook Selection.
  4. Sequence Assembly & Rhythm Pacing.
  5. Auto Transition & Color Grading Assignment.
  6. Royalty-Free Soundtrack Pairing with Automatic Dialogue Ducking.
- **14+ Editing Styles**: Cinematic, Travel, Vlog, Instagram Reel, YouTube, Short Video, Birthday, Wedding, Fashion, Sports, Fast & Energetic, Minimal, Emotional, Documentary, and Auto Select.

### 3. Professional Timeline Editor (Manual Mode)
- **Live Canvas Compositor**: Real-time rendering of video clips, transitions, color grading LUTs, and animated text overlays.
- **Multi-Track Timeline**:
  - Video Track 1 (Primary footage)
  - Video Track 2 (Overlay / B-roll)
  - Titles & Captions Track
  - Background Music Track (with beat markers and waveforms)
- **Timeline Operations**:
  - Split / Cut clip at playhead (`S`)
  - Trimming handles for in/out points
  - Duplicate clip
  - Delete clip (`Del`)
  - Zoom in / Zoom out / Zoom slider
  - Magnet snapping toggle

### 4. Inspector & Creative Tools
- **Transform & Speed Controls**: Speed ramping (0.5x, 1x, 1.5x, 2x), Volume, Fade in / Fade out, Opacity.
- **Color Grading Presets**: Teal & Orange Cinematic, Vibrant Boost, Golden Sunset Warm, Moody Arctic Cool, High-Contrast Noir, Cyberpunk Neon, Vintage Retro 35mm.
- **Transitions Library**: Dissolve, Fade to Black, Slide Right, Zoom Punch, Glitch Distortion, Linear Wipe, Smooth Cross, and Light Leak.
- **Typography & Titles**: Modern lower thirds, animated neon hooks, cinematic chapter headings, and customizable fonts, sizes, colors, and positions.
- **Auto Captions**: Dialogue transcription with word-by-word timestamps and animated subtitle styling.

### 5. Curated Templates System
- 14+ templates across Instagram Reels, YouTube Shorts, Cinematic Widescreen, Travel, Vlog, Fashion, Birthday, Wedding, Business, and Product Promo.
- One-click "Auto-Fit & Open in Editor" workflow automatically slices and slots your media into template structures.

### 6. Smart AI Director Assistant
- Natural-language command interface inside the editor:
  - *"Make this video cinematic"*
  - *"Make a 30 second Instagram Reel"*
  - *"Remove boring parts and tighten cuts"*
  - *"Make the video faster"*
  - *"Add energetic music"*
  - *"Add captions"*
  - *"Make the transitions smoother"*

### 7. Real Hardware-Accelerated FFmpeg Export Pipeline
- Encodes timeline specifications via FFmpeg 9.0 (`libx264`, `libvpx`, `amix`, `xfade`):
  - **Resolutions**: 720p, 1080p, 1440p, 4K
  - **Frame Rates**: 24 FPS, 30 FPS, 60 FPS
  - **Aspect Ratios**: 16:9, 9:16, 1:1, 4:5
  - **Formats**: MP4, WebM
  - **Quality**: Standard, High, Maximum
- Real-time percentage progress, stage updates, instant in-browser playback preview, and video download.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+)
- FFmpeg (available on system PATH)

### Running the Application

From the root directory:

```bash
# Start both backend and frontend concurrently
npm.cmd start
```

Or run services individually:

```bash
# Terminal 1: Start Backend (Port 5000)
npm.cmd run server

# Terminal 2: Start Frontend (Port 3000)
npm.cmd run client
```

Open your browser at **`http://localhost:3000`**.

---

## 📁 Architecture & Directory Structure

```
├── package.json                   # Root orchestrator (npm start / build)
├── server/                        # Node.js + Express + FFmpeg Backend
│   ├── src/
│   │   ├── index.ts               # Express server (Port 5000)
│   │   ├── config.ts              # Storage paths (uploads, seeds, exports)
│   │   ├── routes/
│   │   │   ├── media.ts           # Upload, list, preview, delete media
│   │   │   ├── ai.ts              # Auto edit, assistant, captions, analysis
│   │   │   ├── projects.ts        # Project CRUD & persistence
│   │   │   ├── templates.ts       # Template definitions & slot fitting
│   │   │   └── render.ts          # FFmpeg rendering & progress polling
│   │   └── services/
│   │       ├── ffmpegService.ts   # Probe, thumbnail, scene analyze & render
│   │       ├── aiService.ts       # Auto-edit heuristics & assistant parser
│   │       └── seedService.ts     # Pre-seeded sample clips & music
│   └── storage/                   # File storage (uploads, seeds, exports)
└── client/                        # React 18 + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── App.tsx                # Main router & layout shell
    │   ├── index.css              # Pure black & liquid glass styling
    │   ├── types/                 # Comprehensive TypeScript definitions
    │   ├── store/                 # Global state (timeline, playback, media)
    │   ├── components/
    │   │   ├── layout/            # Sidebar, Header, MobileNav, ToastContainer
    │   │   ├── dashboard/         # DashboardScreen, Project Cards, Quick Stats
    │   │   ├── autoedit/          # AutoEditScreen, Style Picker, AI Pipeline
    │   │   ├── editor/            # VideoEditorScreen, PreviewPlayer, Timeline, Panels
    │   │   ├── templates/         # TemplatesScreen, Slot-fit Modal
    │   │   ├── projects/          # MyProjectsScreen (grid/list, rename, delete)
    │   │   ├── media/             # MediaLibraryScreen (multi-upload, drag & drop)
    │   │   ├── export/            # ExportScreen (4K/1080p, live progress, confetti)
    │   │   ├── settings/          # SettingsScreen (preferences, purge cache)
    │   │   ├── assistant/         # AIAssistantModal (natural language prompt)
    │   │   └── onboarding/        # OnboardingModal ("Create your first video")
    │   └── utils/                 # Timecode math, byte formatting
    └── vite.config.ts             # Vite config with backend proxy
```
