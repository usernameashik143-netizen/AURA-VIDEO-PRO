import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  PlusCircle,
  Clock,
  Film,
  Copy,
  Trash2,
  FolderOpen,
  Edit2,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { formatDuration } from '../../utils/time.js';

export const MyProjectsScreen: React.FC = () => {
  const {
    projects,
    loadProject,
    createNewProject,
    duplicateProject,
    deleteProject,
    saveCurrentProject,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditingTitle(p.title);
  };

  const handleSaveRename = (p: any) => {
    if (editingTitle.trim()) {
      p.title = editingTitle.trim();
      saveCurrentProject();
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#09090b] p-6 md:p-8 space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Projects</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Manage, duplicate, and edit your saved video creations</p>
        </div>

        <button
          onClick={() => createNewProject('16:9')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-300 to-cyan-200 hover:from-cyan-200 hover:to-white border border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and View Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-2xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col overflow-hidden"
            >
              <div
                onClick={() => loadProject(project.id)}
                className="relative aspect-video w-full bg-black/40 overflow-hidden cursor-pointer flex items-center justify-center"
              >
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Film className="w-8 h-8 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                )}

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-medium text-zinc-300">
                  {project.aspectRatio}
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-200">
                  {formatDuration(project.duration || 0)}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {editingId === project.id ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveRename(project)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(project)}
                        autoFocus
                        className="bg-black/50 border border-zinc-600 rounded px-2 py-0.5 text-xs text-white w-full"
                      />
                      <button onClick={() => handleSaveRename(project)} className="text-emerald-400 p-1">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group/title">
                      <h3
                        onClick={() => loadProject(project.id)}
                        className="text-xs font-bold text-white truncate cursor-pointer hover:text-zinc-300 transition-colors"
                      >
                        {project.title}
                      </h3>
                      <button
                        onClick={(e) => startRename(project, e)}
                        className="opacity-0 group-hover/title:opacity-100 text-zinc-500 hover:text-zinc-300 p-1 transition-opacity"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Edited {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => loadProject(project.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>Open Editor</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateProject(project.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl bg-[#121215] border border-zinc-800 overflow-hidden divide-y divide-zinc-800">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => loadProject(project.id)}
              className="p-4 flex items-center justify-between hover:bg-zinc-900/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-10 rounded-lg bg-black/50 overflow-hidden shrink-0 flex items-center justify-center">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white hover:text-zinc-300">{project.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-0.5">
                    <span>{project.aspectRatio}</span>
                    <span>•</span>
                    <span className="font-mono">{formatDuration(project.duration || 0)}</span>
                    <span>•</span>
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => duplicateProject(project.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
