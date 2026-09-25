import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Undo2,
  Redo2,
  Save,
  ArrowUpRight,
  Check,
  Wand2,
  Folder,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { EditorPanels } from './EditorPanels.js';
import { PreviewPlayer } from './PreviewPlayer.js';
import { InspectorPanel } from './InspectorPanel.js';
import { MultiTrackTimeline } from './MultiTrackTimeline.js';

export const VideoEditorScreen: React.FC = () => {
  const {
    currentProject,
    saveCurrentProject,
    setActiveSection,
    canUndo,
    canRedo,
    undo,
    redo,
    setAssistantOpen,
  } = useAppStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(currentProject?.title || 'Untitled Project');
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (currentProject && tempTitle.trim()) {
      currentProject.title = tempTitle.trim();
      saveCurrentProject();
    }
  };

  const handleManualSave = async () => {
    await saveCurrentProject();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen w-screen overflow-hidden bg-[#07070a] text-white">
      {/* TOP EDITOR BAR - Responsive for Desktop & Mobile matching Reference */}
      <header className="h-12 px-3 sm:px-4 bg-[#0a0a0f] border-b border-zinc-800/80 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Left: Back arrow, Uploaded breadcrumb, Project title dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Back Arrow to Dashboard */}
          <button
            onClick={() => setActiveSection('dashboard')}
            className="p-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-colors shrink-0"
            title="Return to Dashboard"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Uploaded Folder Breadcrumb (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-xs shrink-0">
            <Folder className="w-3.5 h-3.5 text-zinc-300" />
            <span className="font-semibold text-zinc-200">Uploaded</span>
          </div>

          <span className="text-zinc-600 hidden sm:inline">/</span>

          {/* Project Title (Inline Editable + Dropdown Caret) */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="bg-zinc-900 border border-zinc-600 rounded-lg px-2 py-0.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTempTitle(currentProject?.title || 'Untitled Project');
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 cursor-pointer group px-1.5 py-0.5 rounded-lg hover:bg-zinc-900/80 transition-colors min-w-0"
              title="Click to rename project"
            >
              <h1 className="text-xs font-bold text-zinc-200 group-hover:text-white truncate max-w-[120px] sm:max-w-[220px]">
                {currentProject?.title || 'Untitled Project'}
              </h1>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-zinc-900 text-cyan-400 border border-cyan-800/60 shrink-0 shadow-sm">
                {currentProject?.aspectRatio || '16:9'}
              </span>
            </div>
          )}
        </div>

        {/* Center: Minimal Undo & Redo (Desktop) */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-25 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-25 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: AI Director, Save & Glowing Cyan Export Button */}
        <div className="flex items-center gap-2">
          {/* AI Director Assistant (Desktop) */}
          <button
            onClick={() => setAssistantOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-violet-300 hover:text-violet-200 border border-violet-700/50 transition-colors shadow-sm"
            title="AI Director Assistant"
          >
            <Wand2 className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Director</span>
          </button>

          {/* Quick Save (Desktop) */}
          <button
            onClick={handleManualSave}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
            title="Save Project"
          >
            {justSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-zinc-400" />
                <span>Save</span>
              </>
            )}
          </button>

          {/* Export CTA Button — Glowing Cyan Gradient matching Reference */}
          <button
            onClick={() => setActiveSection('export')}
            className="flex items-center gap-1 px-3.5 py-1 rounded-xl text-xs font-extrabold text-zinc-950 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:brightness-110 shadow-[0_0_16px_rgba(34,211,238,0.45)] transition-all active:scale-95"
            title="Export Video"
          >
            <span>Export</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-950" />
          </button>
        </div>
      </header>

      {/* 3-ZONE MAIN EDITOR BODY - Dedicated Mobile & Desktop Adaptations */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
        {/* ZONE 1: Tool Navigation + Drawer (Desktop Left Dock + Mobile Bottom Tray/Sheet) */}
        <div className="shrink-0 md:h-full">
          <EditorPanels />
        </div>

        {/* CENTER ZONE: Video Preview (Top) + Multi-Track Timeline (Bottom) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 pb-[64px] md:pb-0">
          {/* Responsive Preview Viewport */}
          <div className="flex-1 flex overflow-hidden min-h-[180px] md:min-h-0 bg-[#050507]">
            <PreviewPlayer />
          </div>

          {/* Touch-Friendly Multi-Track Timeline */}
          <div className="h-[210px] sm:h-[250px] md:h-auto shrink-0 flex flex-col">
            <MultiTrackTimeline />
          </div>
        </div>

        {/* DESKTOP ZONE 3 (RIGHT): Contextual Inspector Panel */}
        <div className="hidden lg:flex shrink-0">
          <InspectorPanel />
        </div>
      </div>
    </div>
  );
};

export default VideoEditorScreen;
