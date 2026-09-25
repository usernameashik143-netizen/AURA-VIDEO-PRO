import React, { useState, useEffect } from 'react';
import {
  Layers,
  Play,
  ArrowRight,
  Sparkles,
  Sliders,
  X,
  Film,
  Music,
  Video,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { TemplateDef, MediaItem } from '../../types/index.js';

export const TemplatesScreen: React.FC = () => {
  const {
    mediaLibrary,
    audioLibrary,
    applyTemplate,
    customizeTemplate,
    addToast,
  } = useAppStore();

  const [templates, setTemplates] = useState<TemplateDef[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'ready_video' | 'editable'>('all');
  const [previewReadyTemplate, setPreviewReadyTemplate] = useState<TemplateDef | null>(null);
  const [customizingTemplate, setCustomizingTemplate] = useState<TemplateDef | null>(null);

  // Customizer state
  const [slotMediaReplacements, setSlotMediaReplacements] = useState<{ [slotIndex: number]: string }>({});
  const [slotTextReplacements, setSlotTextReplacements] = useState<{ [slotIndex: number]: string }>({});
  const [selectedBgmId, setSelectedBgmId] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('cinematic');
  const [activeMediaPickerSlot, setActiveMediaPickerSlot] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      })
      .catch((err) => console.warn('Failed to fetch templates:', err));
  }, []);

  const categories = ['All', 'Cinematic', 'Memories', 'Travel', 'Vlog', 'Promo', 'Fashion', 'Social'];

  const filteredTemplates = templates.filter((t: TemplateDef) => {
    const matchCategory = selectedCategory === 'All' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchType = selectedTypeFilter === 'all' || t.templateType === selectedTypeFilter;
    return matchCategory && matchType;
  });

  const videoClips = mediaLibrary.filter((m) => m.type === 'video');

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOpenTemplate = (template: TemplateDef) => {
    if (template.templateType === 'ready_video') {
      setPreviewReadyTemplate(template);
    } else {
      // Editable blueprint
      setCustomizingTemplate(template);
      const defaultSlots: { [k: number]: string } = {};
      const defaultTexts: { [k: number]: string } = {};
      template.slots.forEach((s) => {
        if (s.textOverlay) defaultTexts[s.index] = s.textOverlay;
      });
      setSlotMediaReplacements(defaultSlots);
      setSlotTextReplacements(defaultTexts);
      setSelectedBgmId(template.musicTrack || audioLibrary[0]?.id || 'bgm-cinematic-pulse');
      setSelectedFilter(template.filter || 'cinematic');
    }
  };

  const handleUseReadyVideo = async (template: TemplateDef) => {
    await applyTemplate(template.id);
    setPreviewReadyTemplate(null);
  };

  const handleSaveCustomizedTemplate = async () => {
    if (!customizingTemplate) return;
    setIsProcessing(true);
    try {
      await customizeTemplate(customizingTemplate.id, {
        customTitle: `${customizingTemplate.name} Edit`,
        slotMedia: slotMediaReplacements,
        slotText: slotTextReplacements,
        musicTrackId: selectedBgmId,
        filter: selectedFilter,
      });

      addToast({
        type: 'success',
        title: 'Template Applied',
        description: `${customizingTemplate.name} customized and loaded into project editor!`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Template Error',
        description: err.message || 'Failed to apply blueprint template.',
      });
    } finally {
      setIsProcessing(false);
      setCustomizingTemplate(null);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#070709] text-white p-6 md:p-8 space-y-6 select-none">
      {/* Top Creative Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d0d12] via-[#14141d] to-[#0a0a0f] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-600/60 text-zinc-200 text-xs font-semibold shadow-sm">
            <Layers className="w-3.5 h-3.5 text-zinc-300" />
            <span>Dual Creative Template Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ready-Made Videos & Editable Templates
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Choose from ready-to-export pre-rendered videos with distinct soundtracks, or customize multi-slot blueprint templates with your own footage, titles, and music.
          </p>
        </div>
      </div>

      {/* Dual Type Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        {/* Type Toggle: All / Ready Video / Editable */}
        <div className="flex items-center gap-1.5 bg-[#121217] p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTypeFilter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Templates ({templates.length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('ready_video')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTypeFilter === 'ready_video'
                ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            <span>Ready-Made Videos</span>
          </button>
          <button
            onClick={() => setSelectedTypeFilter('editable')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTypeFilter === 'editable'
                ? 'bg-violet-950/40 text-violet-200 border border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
            <span>Editable Blueprints</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredTemplates.map((template: TemplateDef) => {
          const isReady = template.templateType === 'ready_video';
          return (
            <div
              key={template.id}
              onClick={() => handleOpenTemplate(template)}
              className="group rounded-2xl bg-[#101016] hover:bg-[#151520] border border-zinc-800/90 hover:border-white/20 p-2.5 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-md hover:-translate-y-1 glow-cinematic"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[9/14] w-full rounded-xl bg-black overflow-hidden mb-2.5">
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

                {/* Badge: READY VIDEO vs EDITABLE */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      isReady
                        ? 'bg-zinc-200 text-black shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                        : 'bg-[#202026] text-zinc-200 border border-zinc-700 shadow-sm'
                    }`}
                  >
                    {template.badge}
                  </span>
                </div>

                {/* Aspect Ratio Badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-zinc-300 border border-white/10">
                  {template.aspectRatio}
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-zinc-200 border border-white/10">
                  {formatDuration(template.duration)}
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl">
                    <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Title and stats */}
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-zinc-200 truncate">
                  {template.name}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                  {isReady ? `Playable Video • ${template.musicTrack}` : `${template.slots.length} Clip Slots • Replaceable`}
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-1 border-t border-zinc-800/80">
                  <span>🔥 {template.views || '12.4K'}</span>
                  <span className="font-semibold text-zinc-300">
                    {isReady ? 'Play Video →' : 'Customize →'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: READY-MADE VIDEO TEMPLATE PLAYER */}
      {/* ============================================================ */}
      {previewReadyTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#111116] border border-zinc-800 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setPreviewReadyTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px] font-bold tracking-wider uppercase">
                READY VIDEO
              </span>
              <h2 className="text-lg font-bold text-white">{previewReadyTemplate.name}</h2>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-zinc-800 shadow-inner">
              <video
                src={previewReadyTemplate.videoUrl || '/seeds/ready_cinematic_vibes.mp4'}
                autoPlay
                controls
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {previewReadyTemplate.description}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1 font-mono">
                <span>Duration: {formatDuration(previewReadyTemplate.duration)}</span>
                <span>•</span>
                <span>Aspect: {previewReadyTemplate.aspectRatio}</span>
                <span>•</span>
                <span>BGM: {previewReadyTemplate.musicTrack}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewReadyTemplate(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleUseReadyVideo(previewReadyTemplate)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg shadow-white/10 transition-all active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>Open in Project Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: EDITABLE TEMPLATE CUSTOMIZER */}
      {/* ============================================================ */}
      {customizingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111116] border border-zinc-800 p-6 sm:p-7 shadow-2xl space-y-5">
            <button
              onClick={() => setCustomizingTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-[#202026] text-zinc-200 border border-zinc-700 text-[10px] font-bold tracking-wider uppercase">
                EDITABLE BLUEPRINT
              </span>
              <h2 className="text-lg font-bold text-white">Customize {customizingTemplate.name}</h2>
            </div>

            <p className="text-xs text-zinc-400">
              Replace footage slot-by-slot with your own media, edit caption overlays, and choose background music.
            </p>

            {/* Media Slots Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-zinc-400" />
                <span>Video Slots ({customizingTemplate.slots.length} Clips)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {customizingTemplate.slots.map((slot) => {
                  const mediaId = slotMediaReplacements[slot.index];
                  const media = mediaLibrary.find((m) => m.id === mediaId);
                  const isPickerOpen = activeMediaPickerSlot === slot.index;

                  return (
                    <div
                      key={slot.index}
                      className="rounded-xl bg-[#15151c] border border-zinc-800 p-3 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
                        <span>{slot.label}</span>
                        <span className="font-mono text-zinc-500">{slot.duration}s</span>
                      </div>

                      {/* Thumbnail Preview */}
                      <div
                        onClick={() => setActiveMediaPickerSlot(isPickerOpen ? null : slot.index)}
                        className="relative aspect-video rounded-lg bg-black/60 overflow-hidden border border-zinc-700/80 cursor-pointer group"
                      >
                        {media?.thumbnailUrl ? (
                          <img
                            src={media.thumbnailUrl}
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                            Select Clip
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <span className="text-[10px] font-bold text-white px-2 py-1 rounded bg-black/70 backdrop-blur-md">
                            Replace ⇄
                          </span>
                        </div>
                      </div>

                      {/* Media Picker Dropdown / Overlay */}
                      {isPickerOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-[#16161e] border border-zinc-700 rounded-xl p-2 z-50 shadow-2xl max-h-48 overflow-y-auto space-y-1">
                          <div className="text-[10px] font-bold text-zinc-400 px-1 pb-1 border-b border-zinc-800">
                            Choose from Media Library:
                          </div>
                          {videoClips.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => {
                                setSlotMediaReplacements((prev) => ({ ...prev, [slot.index]: m.id }));
                                setActiveMediaPickerSlot(null);
                              }}
                              className="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 cursor-pointer text-xs"
                            >
                              <img src={m.thumbnailUrl} alt={m.name} className="w-8 h-6 object-cover rounded" />
                              <span className="truncate text-[11px] text-zinc-200">{m.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Text Overlay Input if slot has text */}
                      {slot.textOverlay !== undefined && (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={slotTextReplacements[slot.index] ?? slot.textOverlay}
                            onChange={(e) =>
                              setSlotTextReplacements((prev) => ({
                                ...prev,
                                [slot.index]: e.target.value,
                              }))
                            }
                            placeholder="Overlay Text..."
                            className="w-full rounded bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-200 border border-zinc-700 focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Background Music Selector & Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Background Music</span>
                </label>
                <select
                  value={selectedBgmId}
                  onChange={(e) => setSelectedBgmId(e.target.value)}
                  className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 focus:outline-none focus:border-zinc-500"
                >
                  {audioLibrary.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.title} ({a.category} • {formatDuration(a.duration)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Color Grading Filter</span>
                </label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 focus:outline-none focus:border-zinc-500"
                >
                  <option value="cinematic">Cinematic Teal & Orange</option>
                  <option value="vibrant">Vibrant High Saturation</option>
                  <option value="vintage">Vintage Warm 35mm</option>
                  <option value="golden_hour">Golden Hour Glow</option>
                  <option value="noir">Noir High-Contrast B&W</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setCustomizingTemplate(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomizedTemplate}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black font-bold text-xs shadow-lg shadow-white/10 transition-all active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>{isProcessing ? 'Loading Template...' : 'Continue to Editor'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TemplatesScreen;
