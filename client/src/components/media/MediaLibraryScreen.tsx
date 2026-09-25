import React, { useState, useRef } from 'react';
import {
  FileVideo,
  UploadCloud,
  Trash2,
  Play,
  Music,
  Image as ImageIcon,
  Search,
  Filter,
  Eye,
  Check,
  Edit2,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { MediaItem } from '../../types/index.js';
import { formatDuration, formatBytes } from '../../utils/time.js';

export const MediaLibraryScreen: React.FC = () => {
  const { mediaLibrary, uploadFiles, deleteMedia, addMediaToTimeline, setActiveSection } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const filteredMedia = mediaLibrary.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#09090b] p-6 md:p-8 space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Media & Asset Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Import video clips, background music, sound effects, and images
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-zinc-100 hover:bg-white border border-zinc-300 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Upload Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all duration-200 text-center cursor-pointer flex flex-col items-center justify-center ${
          isDragging
            ? 'border-zinc-400 bg-zinc-800/40'
            : 'border-zinc-800 bg-[#121215] hover:border-zinc-600 hover:bg-[#141417]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mb-3 shadow-sm">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Drop clips, audio, or images here</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Supports MP4, MOV, WebM, AVI, MKV, MP3, WAV, JPG, PNG (up to 500MB each)
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All', activeClass: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(34,211,238,0.45)]' },
            { id: 'video', label: 'Videos', activeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.45)]' },
            { id: 'image', label: 'Images', activeClass: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_0_15px_rgba(244,114,182,0.45)]' },
            { id: 'audio', label: 'Audio', activeClass: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_15px_rgba(251,191,36,0.45)]' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterType === tab.id
                  ? `${tab.activeClass} font-bold border-transparent`
                  : 'border-zinc-800 bg-[#14141e] text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14141e] border border-zinc-700/80 rounded-full pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMedia.map((media) => {
          const isVideo = media.type === 'video';
          const isAudio = media.type === 'audio';

          return (
            <div
              key={media.id}
              className="group relative rounded-2xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 p-2.5 flex flex-col justify-between transition-all"
            >
              <div
                onClick={() => setPreviewItem(media)}
                className="relative aspect-video rounded-xl bg-black/50 overflow-hidden mb-2 cursor-pointer flex items-center justify-center"
              >
                {media.thumbnailUrl ? (
                  <img src={media.thumbnailUrl} alt={media.name} className="w-full h-full object-cover" />
                ) : isAudio ? (
                  <Music className="w-8 h-8 text-zinc-400" />
                ) : (
                  <FileVideo className="w-8 h-8 text-zinc-500" />
                )}

                {/* Hover Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="w-5 h-5 text-white" />
                </div>

                {media.duration > 0 && (
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-zinc-200 border border-white/10">
                    {formatDuration(media.duration)}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white truncate" title={media.name}>
                  {media.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                  <span>{formatBytes(media.size)}</span>
                  <span>{media.aspectRatio}</span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => {
                    addMediaToTimeline(media, isAudio ? 'audio' : 'video');
                    setActiveSection('editor');
                  }}
                  className="text-[11px] font-semibold text-zinc-300 hover:text-white"
                >
                  + Timeline
                </button>
                <button
                  onClick={() => deleteMedia(media.id)}
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#121215] rounded-3xl p-6 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{previewItem.name}</h3>
                <p className="text-[11px] text-zinc-400">
                  {previewItem.width}x{previewItem.height} • {formatDuration(previewItem.duration)}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-800">
              {previewItem.type === 'video' ? (
                <video src={previewItem.url} controls autoPlay className="w-full h-full object-contain" />
              ) : previewItem.type === 'audio' ? (
                <div className="p-8 text-center space-y-4">
                  <Music className="w-16 h-16 text-zinc-300 mx-auto animate-pulse" />
                  <audio src={previewItem.url} controls autoPlay className="w-full" />
                </div>
              ) : (
                <img src={previewItem.url} alt={previewItem.name} className="w-full h-full object-contain" />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  addMediaToTimeline(previewItem, previewItem.type === 'audio' ? 'audio' : 'video');
                  setPreviewItem(null);
                  setActiveSection('editor');
                }}
                className="px-5 py-2 rounded-xl font-bold text-xs bg-zinc-100 hover:bg-white text-zinc-950 border border-zinc-300 shadow-sm transition-all"
              >
                Add to Editor Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
